import { NextRequest } from 'next/server';
import { DELETE } from './route';
import { getServerSession } from 'next-auth';
import { supabaseDb } from '@/lib/database-supabase';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/database-supabase', () => ({
  supabaseDb: {
    deleteRSVPWithOwnerCheck: jest.fn(),
  },
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('DELETE /api/rsvp/[id]', () => {
  const mockUserId = 'user-123';
  const mockRsvpId = 'rsvp-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = () => {
    return new NextRequest(`http://localhost/api/rsvp/${mockRsvpId}`, {
      method: 'DELETE',
    });
  };

  it('should return 401 Unauthorized if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = createMockRequest();
    const response = await DELETE(req, { params: Promise.resolve({ id: mockRsvpId }) });
    expect(response.status).toBe(401);
  });

  it('should return 404 Not Found if RSVP does not exist', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });
    
    (supabaseDb.deleteRSVPWithOwnerCheck as jest.Mock).mockResolvedValue(false);
    const req = createMockRequest();
    const response = await DELETE(req, { params: Promise.resolve({ id: mockRsvpId }) });
    expect(response.status).toBe(404);
  });

  it('should successfully delete RSVP if owner check passes', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });
    (supabaseDb.deleteRSVPWithOwnerCheck as jest.Mock).mockResolvedValue(true);

    const req = createMockRequest();
    const response = await DELETE(req, { params: Promise.resolve({ id: mockRsvpId }) });
    expect(response.status).toBe(200);
    expect(supabaseDb.deleteRSVPWithOwnerCheck).toHaveBeenCalledWith(mockRsvpId, mockUserId);
  });

  it('should return 500 if database deletion fails', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });
    (supabaseDb.deleteRSVPWithOwnerCheck as jest.Mock).mockRejectedValue(new Error('DB Error'));

    const req = createMockRequest();
    const response = await DELETE(req, { params: Promise.resolve({ id: mockRsvpId }) });
    expect(response.status).toBe(500);
  });
});
