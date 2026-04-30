import { NextRequest } from 'next/server';
import { POST } from './route';
import { getServerSession } from 'next-auth/next';

// Mock next-auth/next
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('POST /api/templates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 Unauthorized if user is not authenticated', async () => {
    // Mock unauthenticated session
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/templates', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Template',
        occasion: 'birthday',
        theme: 'elegant',
        image_url: 'http://example.com/image.jpg',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });
});
