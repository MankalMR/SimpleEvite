import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/database-supabase';
import { sendEventReminderEmail, prepareReminderData } from '@/lib/email-service';
import type { Invitation, RSVP } from '@/lib/supabase';
import { logger } from "@/lib/logger";

type InvitationWithUser = Invitation & { 
  users: { name: string; email: string } | null 
};

/**
 * Cron job endpoint to send event reminders
 *
 * This endpoint should be called daily (e.g., at 9 AM) to check for events
 * happening in 1-3 days and send reminder emails to guests who opted in.
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

    // Calculate date range: 1 to 3 days from now
    const oneDayFromNowStart = new Date();
    oneDayFromNowStart.setDate(oneDayFromNowStart.getDate() + 1);
    oneDayFromNowStart.setHours(0, 0, 0, 0);

    const threeDaysFromNowEnd = new Date();
    threeDaysFromNowEnd.setDate(threeDaysFromNowEnd.getDate() + 3);
    threeDaysFromNowEnd.setHours(23, 59, 59, 999);

    // Fetch invitations with events happening in 1-3 days using DAL
    const invitations = await supabaseDb.getInvitationsForReminders(
      oneDayFromNowStart.toISOString().split('T')[0],
      threeDaysFromNowEnd.toISOString().split('T')[0]
    );

    if (!invitations || invitations.length === 0) {
      logger.info('No upcoming events found in the 1-3 day window');
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
      provider_response?: Record<string, unknown>;
      error_message?: string;
      sent_at: string;
    }> = [];

    // Extract all invitation IDs to fetch RSVPs in one batch
    const invitationIds = invitations.map((inv) => inv.id);

    // Fetch all pending RSVPs for these invitations in a single query using DAL
    const allRsvps = await supabaseDb.getPendingRSVPsForInvitations(invitationIds);

    // Group RSVPs by invitation_id for O(1) lookup using Map for better performance
    const rsvpsByInvitationId = new Map<string, RSVP[]>();
    for (const rsvp of allRsvps || []) {
      let group = rsvpsByInvitationId.get(rsvp.invitation_id);
      if (!group) {
        group = [];
        rsvpsByInvitationId.set(rsvp.invitation_id, group);
      }
      group.push(rsvp as RSVP);
    }
    // Prepare all email sending tasks
    const emailTasks: Array<() => Promise<void>> = [];

    // Process each invitation
    for (const invitation of invitations) {
      logger.info(`Processing invitation: ${invitation.title} (${invitation.id})`);

      const rsvps = rsvpsByInvitationId.get(invitation.id);

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
          const invWithUser = invitation as unknown as InvitationWithUser;
          const reminderData = prepareReminderData(
            rsvp as RSVP,
            invitation as Invitation,
            invWithUser.users?.name
          );

          if (!reminderData) {
            logger.info(`Skipping RSVP ${rsvp.id} - no email or notifications disabled`);
            results.skippedCount++;

            skippedRsvpIds.push(rsvp.id);
            continue;
          }

          // Add to tasks array instead of awaiting immediately
          emailTasks.push(async () => {
            try {
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
                  provider_response: emailResult.response as Record<string, unknown>,
                  sent_at: new Date().toISOString(),
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
                  sent_at: new Date().toISOString(),
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

              logger.error({ error }, `Error sending email for RSVP ${rsvp.id}:`);
            }
          });
        } catch (error) {
          results.failedCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push({
            rsvpId: rsvp.id,
            error: errorMessage,
          });
          failedRsvpIds.push(rsvp.id);

          logger.error({ error }, `Error preparing RSVP ${rsvp.id}:`);
        }
      }
    }

    // Process email tasks in chunks to avoid rate limiting and memory issues
    const CHUNK_SIZE = 50;
    for (let i = 0; i < emailTasks.length; i += CHUNK_SIZE) {
      const chunk = emailTasks.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map((task) => task()));
    }

    // Execute batch DB operations using DAL
    try {
      const batchUpdates: Array<{ id: string; status: string; sentAt?: string }> = [];
      
      skippedRsvpIds.forEach(id => batchUpdates.push({ id, status: 'skipped' }));
      sentRsvpIds.forEach(id => batchUpdates.push({ id, status: 'sent', sentAt: new Date().toISOString() }));
      failedRsvpIds.forEach(id => batchUpdates.push({ id, status: 'failed' }));

      if (batchUpdates.length > 0) {
        await supabaseDb.batchUpdateRSVPStatuses(batchUpdates);
      }

      if (notificationLogsToInsert.length > 0) {
        await supabaseDb.batchInsertNotificationLogs(notificationLogsToInsert);
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


