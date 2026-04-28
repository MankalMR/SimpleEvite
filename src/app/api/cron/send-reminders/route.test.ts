import { NextRequest } from 'next/server';
import { GET } from './route';
import { supabaseDb } from '@/lib/database-supabase';
import { sendEventReminderEmail, prepareReminderData } from '@/lib/email-service';
import { logger } from '@/lib/logger';

// Mock dependencies
jest.mock('@/lib/database-supabase', () => ({
  supabaseDb: {
    getInvitationsForReminders: jest.fn(),
    getPendingRSVPsForInvitations: jest.fn(),
    batchUpdateRSVPStatuses: jest.fn(),
    batchInsertNotificationLogs: jest.fn(),
  },
}));

jest.mock('@/lib/email-service', () => ({
  sendEventReminderEmail: jest.fn(),
  prepareReminderData: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('GET /api/cron/send-reminders', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, CRON_SECRET: 'test-secret' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function createMockRequest(authHeader: string | null = 'Bearer test-secret') {
    return new NextRequest('http://localhost:3000/api/cron/send-reminders', {
      headers: authHeader ? new Headers({ authorization: authHeader }) : new Headers(),
    });
  }

  it('should return 500 if CRON_SECRET is not set', async () => {
    delete process.env.CRON_SECRET;
    const req = createMockRequest();

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Server misconfiguration');
    expect(logger.error).toHaveBeenCalledWith('CRON_SECRET environment variable not set');
  });

  it('should return 401 if unauthorized', async () => {
    const req = createMockRequest('Bearer wrong-secret');

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(logger.warn).toHaveBeenCalledWith('Unauthorized cron request');
  });

  it('should return 200 with no processed events if no invitations are found', async () => {
    (supabaseDb.getInvitationsForReminders as jest.Mock).mockResolvedValue([]);

    const req = createMockRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.processed).toBe(0);
    expect(data.message).toBe('No events requiring reminders');
  });

  it('should process RSVPs in batches and update database successfully', async () => {
    const mockInvitations = [
      { id: 'inv_1', title: 'Event 1', users: { name: 'Org 1', email: 'org1@ex.com' } },
      { id: 'inv_2', title: 'Event 2', users: { name: 'Org 2', email: 'org2@ex.com' } }
    ];

    const mockRsvps = [
      { id: 'rsvp_1', invitation_id: 'inv_1', email: 'guest1@ex.com', response: 'yes' },
      { id: 'rsvp_2', invitation_id: 'inv_1', email: 'guest2@ex.com', response: 'yes' },
      { id: 'rsvp_3', invitation_id: 'inv_2', email: 'guest3@ex.com', response: 'yes' } // Will be skipped
    ];

    (supabaseDb.getInvitationsForReminders as jest.Mock).mockResolvedValue(mockInvitations);
    (supabaseDb.getPendingRSVPsForInvitations as jest.Mock).mockResolvedValue(mockRsvps);
    (supabaseDb.batchUpdateRSVPStatuses as jest.Mock).mockResolvedValue(undefined);
    (supabaseDb.batchInsertNotificationLogs as jest.Mock).mockResolvedValue(undefined);

    // Mock prepareReminderData to return data for first two RSVPs, null for the third
    (prepareReminderData as jest.Mock)
      .mockReturnValueOnce({ to: 'guest1@ex.com', guestName: 'Guest 1' })
      .mockReturnValueOnce({ to: 'guest2@ex.com', guestName: 'Guest 2' })
      .mockReturnValueOnce(null);

    // Mock email sender to succeed for first, fail for second
    (sendEventReminderEmail as jest.Mock)
      .mockResolvedValueOnce({ success: true, response: { id: 'msg_1' } })
      .mockResolvedValueOnce({ success: false, error: 'Email bounced' });

    const req = createMockRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    const results = data.results;
    expect(results.totalInvitations).toBe(2);
    expect(results.totalRSVPs).toBe(3);

    // 1 skipped (rsvp_3), 1 sent (rsvp_1), 1 failed (rsvp_2)
    expect(results.skippedCount).toBe(1);
    expect(results.sentCount).toBe(1);
    expect(results.failedCount).toBe(1);
    expect(results.errors).toHaveLength(1);
    expect(results.errors[0].rsvpId).toBe('rsvp_2');

    // Verify batched DB updates via DAL
    expect(supabaseDb.batchUpdateRSVPStatuses).toHaveBeenCalled();
    expect(supabaseDb.batchInsertNotificationLogs).toHaveBeenCalled();
  });

  it('should handle database fetch errors gracefully', async () => {
    (supabaseDb.getInvitationsForReminders as jest.Mock).mockRejectedValue(new Error('DB Error'));

    const req = createMockRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
