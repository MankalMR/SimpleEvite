import { NextRequest } from 'next/server';
import { POST } from './route';
import { supabase } from '@/lib/supabase';
import { supabaseDb } from '@/lib/database-supabase';
import { sendRsvpConfirmationEmail, sendHostRsvpNotificationEmail } from '@/lib/email-service';
import { validateRequestBody } from '@/lib/api-security';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('@/lib/database-supabase', () => ({
  supabaseDb: {
    getUserEmail: jest.fn(),
    createRSVP: jest.fn(),
  },
}));

jest.mock('@/lib/email-service', () => ({
  sendRsvpConfirmationEmail: jest.fn(),
  sendHostRsvpNotificationEmail: jest.fn(),
}));

jest.mock('@/lib/api-security', () => ({
  withSecurity: jest.fn((req, handler) => handler(req)),
  validateRequestBody: jest.fn(),
  addSecurityHeaders: jest.fn((res) => res),
  RATE_LIMIT_PRESETS: { RSVP: 'rsvp' },
  logSecurityEvent: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('POST /api/rsvp', () => {
  const mockInvitationId = 'invitation-123';
  const mockInvitation = {
    id: mockInvitationId,
    user_id: 'user-456',
    title: 'Party',
    event_date: '2025-01-01',
    event_time: '18:00',
    location: 'Home',
    description: 'Fun party',
    share_token: 'token-789',
  };

  const mockRsvpData = {
    name: 'Guest',
    response: 'yes',
    comment: 'Coming!',
    email: 'guest@example.com',
    invitation_id: mockInvitationId,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (validateRequestBody as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        name: mockRsvpData.name,
        response: mockRsvpData.response,
        comment: mockRsvpData.comment,
      },
      rawData: mockRsvpData,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockInvitation, error: null }),
    });

    (supabaseDb.getUserEmail as jest.Mock).mockResolvedValue('host@example.com');
    (supabaseDb.createRSVP as jest.Mock).mockResolvedValue({ id: 'rsvp-001' });
    (sendRsvpConfirmationEmail as jest.Mock).mockResolvedValue({ success: true });
    (sendHostRsvpNotificationEmail as jest.Mock).mockResolvedValue({ success: true });
  });

  const createMockRequest = () => {
    return new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify(mockRsvpData),
    });
  };

  it('should successfully create RSVP and send emails', async () => {
    const req = createMockRequest();
    const response = await POST(req);

    expect(response.status).toBe(201);
    expect(supabaseDb.createRSVP).toHaveBeenCalled();
    expect(sendRsvpConfirmationEmail).toHaveBeenCalled();
    expect(sendHostRsvpNotificationEmail).toHaveBeenCalled();
  });

  it('should handle missing guest email', async () => {
    (validateRequestBody as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        name: mockRsvpData.name,
        response: mockRsvpData.response,
        comment: mockRsvpData.comment,
      },
      rawData: { ...mockRsvpData, email: undefined },
    });

    const req = createMockRequest();
    const response = await POST(req);

    expect(response.status).toBe(201);
    expect(sendRsvpConfirmationEmail).not.toHaveBeenCalled();
    expect(sendHostRsvpNotificationEmail).toHaveBeenCalled();
  });

  it('should handle missing host email', async () => {
    (supabaseDb.getUserEmail as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest();
    const response = await POST(req);

    expect(response.status).toBe(201);
    expect(sendRsvpConfirmationEmail).toHaveBeenCalled();
    expect(sendHostRsvpNotificationEmail).not.toHaveBeenCalled();
  });
});
