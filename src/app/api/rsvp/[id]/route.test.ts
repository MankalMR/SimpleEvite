import { NextRequest } from 'next/server';
import { DELETE } from './route';
import { getServerSession } from 'next-auth';
import { supabaseAdmin } from '@/lib/supabase';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
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
    
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === 'rsvps') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        };
      }
      return {};
    });

    const req = createMockRequest();
    const response = await DELETE(req, { params: Promise.resolve({ id: mockRsvpId }) });
    expect(response.status).toBe(404);
  });

  it('should return 403 Forbidden if user does not own the invitation (using object format)', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });
    
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === 'rsvps') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: mockRsvpId,
              invitations: { user_id: 'other-user' } // Object format
            },
            error: null
          }),
        };
      }
      return {};
    });

    const req = createMockRequest();
    const response = await DELETE(req, { params: Promise.resolve({ id: mockRsvpId }) });
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toContain('You do not own the invitation');
  });

  it('should successfully delete RSVP if user owns the invitation (using object format - THE BUG FIX)', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });
    
    const mockDeleteEq = jest.fn().mockResolvedValue({ error: null });
    const mockDelete = jest.fn().mockReturnValue({ eq: mockDeleteEq });

    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === 'rsvps') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: mockRsvpId,
              invitations: { user_id: mockUserId } // Object format
            },
            error: null
          }),
          delete: mockDelete,
        };
      }
      return {};
    });

    const req = createMockRequest();
    const response = await DELETE(req, { params: Promise.resolve({ id: mockRsvpId }) });
    expect(response.status).toBe(200);
    expect(mockDelete).toHaveBeenCalled();
    expect(mockDeleteEq).toHaveBeenCalledWith('id', mockRsvpId);
  });

  it('should successfully delete RSVP if user owns the invitation (using array format for robustness)', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });
    
    const mockDeleteEq = jest.fn().mockResolvedValue({ error: null });
    const mockDelete = jest.fn().mockReturnValue({ eq: mockDeleteEq });

    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === 'rsvps') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: mockRsvpId,
              invitations: [{ user_id: mockUserId }] // Array format
            },
            error: null
          }),
          delete: mockDelete,
        };
      }
      return {};
    });

    const req = createMockRequest();
    const response = await DELETE(req, { params: Promise.resolve({ id: mockRsvpId }) });
    expect(response.status).toBe(200);
    expect(mockDelete).toHaveBeenCalled();
  });

  it('should return 500 if database deletion fails', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });
    
    (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
      if (table === 'rsvps') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              id: mockRsvpId,
              invitations: { user_id: mockUserId }
            },
            error: null
          }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
          }),
        };
      }
      return {};
    });

    const req = createMockRequest();
    const response = await DELETE(req, { params: Promise.resolve({ id: mockRsvpId }) });
    expect(response.status).toBe(500);
  });
});
