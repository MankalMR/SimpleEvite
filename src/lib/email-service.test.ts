import { sendTestEmail } from './email-service';
import { Resend } from 'resend';

// Create a mock setup directly in the module mock
jest.mock('resend', () => {
  const mockSend = jest.fn();
  return {
    Resend: jest.fn().mockImplementation(() => {
      return {
        emails: {
          send: mockSend,
        },
      };
    }),
  };
});

describe('sendTestEmail', () => {
  let mockSend: jest.Mock;

  beforeEach(() => {
    // We can extract the mock implementation from the instantiated Resend object
    const resendInstance = new Resend();
    mockSend = resendInstance.emails.send as jest.Mock;
    mockSend.mockClear();
  });

  it('should successfully send an email', async () => {
    mockSend.mockResolvedValueOnce({ id: 'test-id', data: { id: 'test-id' } });

    const result = await sendTestEmail('test@example.com');

    expect(result.success).toBe(true);
    expect(result.response).toEqual({ id: 'test-id', data: { id: 'test-id' } });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Test Email from Simple Evite',
      })
    );
  });

  it('should handle errors thrown by Resend', async () => {
    const error = new Error('API Error');
    mockSend.mockRejectedValueOnce(error);

    const result = await sendTestEmail('test@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('API Error');
  });

  it('should handle non-Error objects thrown', async () => {
    mockSend.mockRejectedValueOnce('String Error');

    const result = await sendTestEmail('test@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown error');
  });
});
