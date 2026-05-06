import { NextRequest } from 'next/server';
import { PUT, DELETE } from './route';
import { getServerSession } from 'next-auth/next';

// Mock next-auth/next
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('PUT /api/templates/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 Unauthorized if user is not authenticated', async () => {
    // Mock unauthenticated session
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/templates/1', {
      method: 'PUT',
      body: JSON.stringify({
        name: 'Updated Template',
      }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 401 Unauthorized if user is authenticated but not an admin', async () => {
    // Mock authenticated session
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'user@example.com' } });

    // Mock ADMIN_EMAILS environment variable
    process.env.ADMIN_EMAILS = 'admin@example.com';

    const req = new NextRequest('http://localhost/api/templates/1', {
      method: 'PUT',
      body: JSON.stringify({
        name: 'Updated Template',
      }),
    });

    const response = await PUT(req, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });
});

describe('DELETE /api/templates/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 Unauthorized if user is not authenticated', async () => {
    // Mock unauthenticated session
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/templates/1', {
      method: 'DELETE',
    });

    const response = await DELETE(req, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 401 Unauthorized if user is authenticated but not an admin', async () => {
    // Mock authenticated session
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'user@example.com' } });

    // Mock ADMIN_EMAILS environment variable
    process.env.ADMIN_EMAILS = 'admin@example.com';

    const req = new NextRequest('http://localhost/api/templates/1', {
      method: 'DELETE',
    });

    const response = await DELETE(req, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });
});
