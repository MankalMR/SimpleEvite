import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEventReminderEmail, prepareReminderData } from '@/lib/email-service';
import type { Invitation, RSVP } from '@/lib/supabase';
import { logger } from "@/lib/logger";

/**
 * Cron job endpoint to send event reminders
 *
 * This endpoint should be called daily (e.g., at 9 AM) to check for events
 * happening in 2-3 days and send reminder emails to guests who opted in.
 *
 * Security: Protected by CRON_SECRET environment variable
 *
 * To schedule with Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-reminders",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 *
 * Or use an external cron service like EasyCron or cron-job.org
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is authorized (from cron service)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      logger.error('CRON_SECRET environment variable not set');
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('Starting reminder notification job...');

    // Calculate date range: 2-3 days from now
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    // Fetch invitations with events happening in 2-3 days
    const { data: invitations, error: invitationsError } = await supabaseAdmin
      .from('invitations')
      .select(`
        *,
        users (
          name,
          email
        )
      `)
      .gte('event_date', twoDaysFromNow.toISOString().split('T')[0])
      .lte('event_date', threeDaysFromNow.toISOString().split('T')[0]);

    if (invitationsError) {
      logger.error({ invitationsError }, 'Error fetching invitations:');
      return NextResponse.json(
        { error: 'Failed to fetch invitations', details: invitationsError.message },
        { status: 500 }
      );
    }

    if (!invitations || invitations.length === 0) {
      logger.info('No upcoming events found in the 2-3 day window');
      return NextResponse.json({
        success: true,
        message: 'No events requiring reminders',
        processed: 0,
      });
    }

    logger.info(`Found ${invitations.length} upcoming events`);

    const results = {
      totalInvitations: invitations.length,
      totalRSVPs: 0,
      sentCount: 0,
      skippedCount: 0,
      failedCount: 0,
      errors: [] as Array<{ rsvpId: string; error: string }>,
    };

    // Arrays to track batched DB operations
    const skippedRsvpIds: string[] = [];
    const sentRsvpIds: string[] = [];
    const failedRsvpIds: string[] = [];
    const notificationLogsToInsert: Array<{
      rsvp_id: string;
      invitation_id: string;
      notification_type: 'email';
      recipient: string;
      status: 'sent' | 'failed';
      provider_response?: unknown;
      error_message?: string;
    }> = [];

    // Process each invitation
    for (const invitation of invitations) {
      logger.info(`Processing invitation: ${invitation.title} (${invitation.id})`);

      // Fetch RSVPs for this invitation that need reminders
      const { data: rsvps, error: rsvpsError } = await supabaseAdmin
        .from('rsvps')
        .select('*')
        .eq('invitation_id', invitation.id)
        .eq('response', 'yes')
        .eq('reminder_status', 'pending')
        .not('email', 'is', null);

      if (rsvpsError) {
        logger.error({ rsvpsError }, `Error fetching RSVPs for invitation ${invitation.id}:`);
        continue;
      }

      if (!rsvps || rsvps.length === 0) {
        logger.info(`No pending reminders for invitation ${invitation.id}`);
        continue;
      }

      results.totalRSVPs += rsvps.length;
      logger.info(`Found ${rsvps.length} RSVPs needing reminders`);

      // Send reminder to each guest
      for (const rsvp of rsvps) {
        try {
          // Prepare reminder data
          const reminderData = prepareReminderData(
            rsvp as RSVP,
            invitation as Invitation,
            invitation.users?.name
          );

          if (!reminderData) {
            logger.info(`Skipping RSVP ${rsvp.id} - no email or notifications disabled`);
            results.skippedCount++;

            skippedRsvpIds.push(rsvp.id);
            continue;
          }

          // Send email
          logger.info(`Sending reminder to ${reminderData.guestName} <${reminderData.to}>`);
          const emailResult = await sendEventReminderEmail(reminderData);

          if (emailResult.success) {
            results.sentCount++;
            sentRsvpIds.push(rsvp.id);

            notificationLogsToInsert.push({
              rsvp_id: rsvp.id,
              invitation_id: invitation.id,
              notification_type: 'email',
              recipient: reminderData.to,
              status: 'sent',
              provider_response: emailResult.response,
            });

            logger.info(`✓ Successfully sent reminder to ${reminderData.to}`);
          } else {
            results.failedCount++;
            results.errors.push({
              rsvpId: rsvp.id,
              error: emailResult.error || 'Unknown error',
            });
            failedRsvpIds.push(rsvp.id);

            notificationLogsToInsert.push({
              rsvp_id: rsvp.id,
              invitation_id: invitation.id,
              notification_type: 'email',
              recipient: reminderData.to,
              status: 'failed',
              error_message: emailResult.error,
            });

            logger.error({ err: emailResult.error }, `✗ Failed to send reminder to ${reminderData.to}:`);
          }
        } catch (error) {
          results.failedCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push({
            rsvpId: rsvp.id,
            error: errorMessage,
          });
          failedRsvpIds.push(rsvp.id);

          logger.error({ error }, `Error processing RSVP ${rsvp.id}:`);
        }
      }
    }

    // Execute batch DB operations
    try {
      if (skippedRsvpIds.length > 0) {
        await supabaseAdmin
          .from('rsvps')
          .update({ reminder_status: 'skipped' })
          .in('id', skippedRsvpIds);
      }

      if (sentRsvpIds.length > 0) {
        await supabaseAdmin
          .from('rsvps')
          .update({
            reminder_sent_at: new Date().toISOString(),
            reminder_status: 'sent',
          })
          .in('id', sentRsvpIds);
      }

      if (failedRsvpIds.length > 0) {
        await supabaseAdmin
          .from('rsvps')
          .update({ reminder_status: 'failed' })
          .in('id', failedRsvpIds);
      }

      if (notificationLogsToInsert.length > 0) {
        await supabaseAdmin.from('notification_logs').insert(notificationLogsToInsert);
      }
    } catch (dbError) {
      logger.error({ dbError }, 'Error updating database status after processing reminders:');
    }

    logger.info({ results }, 'Reminder notification job complete:');

    return NextResponse.json({
      success: true,
      message: 'Reminder notifications processed',
      results,
    });
  } catch (error) {
    logger.error({ error }, 'Critical error in send-reminders cron job:');
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual testing
 * Same functionality as GET but can be called manually for testing
 */
export async function POST(request: NextRequest) {
  return GET(request);
}


