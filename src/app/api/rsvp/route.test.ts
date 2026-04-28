import { NextRequest } from 'next/server';
import { POST } from './route';
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
    upsertRSVP: jest.fn(),
    getInvitationByToken: jest.fn(),
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
    share_token: 'token-789',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (validateRequestBody as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        name: mockRsvpData.name,
        response: mockRsvpData.response,
        comment: mockRsvpData.comment,
        email: mockRsvpData.email,
      },
      rawData: mockRsvpData,
    });

    (supabaseDb.getInvitationByToken as jest.Mock).mockResolvedValue(mockInvitation);

    (supabaseDb.getUserEmail as jest.Mock).mockResolvedValue('host@example.com');
    (supabaseDb.upsertRSVP as jest.Mock).mockResolvedValue({ rsvp: { id: 'rsvp-001' }, isUpdate: false });
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
    expect(supabaseDb.upsertRSVP).toHaveBeenCalled();
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

  it('should return 401 if share_token is missing', async () => {
    (validateRequestBody as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        name: mockRsvpData.name,
        response: mockRsvpData.response,
        comment: mockRsvpData.comment,
      },
      rawData: { ...mockRsvpData, share_token: undefined },
    });

    const req = createMockRequest();
    const response = await POST(req);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Valid share token is required');
  });

  it('should return 404 if share_token is invalid or does not match invitation', async () => {
    (supabaseDb.getInvitationByToken as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest();
    const response = await POST(req);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Invitation not found or invalid share token');
  });
});
