import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEventReminderEmail, prepareReminderData } from '@/lib/email-service';
import type { Invitation, RSVP } from '@/lib/supabase';

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
      console.error('CRON_SECRET environment variable not set');
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting reminder notification job...');

    // Calculate date range: 2-3 days from now
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(0, 0, 0, 0);

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    console.log('Looking for events between:', {
      start: twoDaysFromNow.toISOString(),
      end: threeDaysFromNow.toISOString(),
    });

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
      console.error('Error fetching invitations:', invitationsError);
      return NextResponse.json(
        { error: 'Failed to fetch invitations', details: invitationsError.message },
        { status: 500 }
      );
    }

    if (!invitations || invitations.length === 0) {
      console.log('No upcoming events found in the 2-3 day window');
      return NextResponse.json({
        success: true,
        message: 'No events requiring reminders',
        processed: 0,
      });
    }

    console.log(`Found ${invitations.length} upcoming events`);

    const results = {
      totalInvitations: invitations.length,
      totalRSVPs: 0,
      sentCount: 0,
      skippedCount: 0,
      failedCount: 0,
      errors: [] as Array<{ rsvpId: string; error: string }>,
    };

    // Process each invitation
    for (const invitation of invitations) {
      console.log(`Processing invitation: ${invitation.title} (${invitation.id})`);

      // Fetch RSVPs for this invitation that need reminders
      const { data: rsvps, error: rsvpsError } = await supabaseAdmin
        .from('rsvps')
        .select('*')
        .eq('invitation_id', invitation.id)
        .eq('response', 'yes')
        .eq('reminder_status', 'pending')
        .not('email', 'is', null);

      if (rsvpsError) {
        console.error(`Error fetching RSVPs for invitation ${invitation.id}:`, rsvpsError);
        continue;
      }

      if (!rsvps || rsvps.length === 0) {
        console.log(`No pending reminders for invitation ${invitation.id}`);
        continue;
      }

      results.totalRSVPs += rsvps.length;
      console.log(`Found ${rsvps.length} RSVPs needing reminders`);

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
            console.log(`Skipping RSVP ${rsvp.id} - no email or notifications disabled`);
            results.skippedCount++;

            // Update status to skipped
            await supabaseAdmin
              .from('rsvps')
              .update({ reminder_status: 'skipped' })
              .eq('id', rsvp.id);

            continue;
          }

          // Send email
          console.log(`Sending reminder to ${reminderData.guestName} <${reminderData.to}>`);
          const emailResult = await sendEventReminderEmail(reminderData);

          if (emailResult.success) {
            results.sentCount++;

            // Update RSVP status
            await supabaseAdmin
              .from('rsvps')
              .update({
                reminder_sent_at: new Date().toISOString(),
                reminder_status: 'sent',
              })
              .eq('id', rsvp.id);

            // Log notification
            await supabaseAdmin.from('notification_logs').insert({
              rsvp_id: rsvp.id,
              invitation_id: invitation.id,
              notification_type: 'email',
              recipient: reminderData.to,
              status: 'sent',
              provider_response: emailResult.response,
            });

            console.log(`✓ Successfully sent reminder to ${reminderData.to}`);
          } else {
            results.failedCount++;
            results.errors.push({
              rsvpId: rsvp.id,
              error: emailResult.error || 'Unknown error',
            });

            // Update RSVP status
            await supabaseAdmin
              .from('rsvps')
              .update({ reminder_status: 'failed' })
              .eq('id', rsvp.id);

            // Log notification failure
            await supabaseAdmin.from('notification_logs').insert({
              rsvp_id: rsvp.id,
              invitation_id: invitation.id,
              notification_type: 'email',
              recipient: reminderData.to,
              status: 'failed',
              error_message: emailResult.error,
            });

            console.error(`✗ Failed to send reminder to ${reminderData.to}:`, emailResult.error);
          }
        } catch (error) {
          results.failedCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push({
            rsvpId: rsvp.id,
            error: errorMessage,
          });

          console.error(`Error processing RSVP ${rsvp.id}:`, error);

          // Update RSVP status
          await supabaseAdmin
            .from('rsvps')
            .update({ reminder_status: 'failed' })
            .eq('id', rsvp.id);
        }
      }
    }

    console.log('Reminder notification job complete:', results);

    return NextResponse.json({
      success: true,
      message: 'Reminder notifications processed',
      results,
    });
  } catch (error) {
    console.error('Critical error in send-reminders cron job:', error);
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


