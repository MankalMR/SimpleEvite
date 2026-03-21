import { sendTestEmail, sendRsvpConfirmationEmail, sendEventUpdateEmail } from './email-service';
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

describe('sendRsvpConfirmationEmail', () => {
  let mockSend: jest.Mock;

  beforeEach(() => {
    const resendInstance = new Resend();
    mockSend = resendInstance.emails.send as jest.Mock;
    mockSend.mockClear();
  });

  const validParams = {
    to: 'guest@example.com',
    guestName: 'John Doe',
    eventTitle: 'Birthday Party',
    eventDate: '2025-05-15',
    eventTime: '18:00',
    location: 'Central Park',
    description: 'Come celebrate with us',
    inviteUrl: 'https://evite.example.com/invite/token123',
  };

  it('should successfully send an RSVP confirmation email', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'test-msg-id' } });

    const result = await sendRsvpConfirmationEmail(validParams);

    expect(result.success).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: validParams.to,
        subject: `RSVP Confirmed: ${validParams.eventTitle} 🎉`,
        html: expect.stringContaining('Add to Google Calendar'),
        text: expect.stringContaining(validParams.eventTitle),
      })
    );
  });

  it('should handle errors returned in the response object from Resend', async () => {
    mockSend.mockResolvedValueOnce({ error: { message: 'Invalid API key' } });

    const result = await sendRsvpConfirmationEmail(validParams);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid API key');
  });
});

describe('sendEventUpdateEmail', () => {
  let mockSend: jest.Mock;

  beforeEach(() => {
    const resendInstance = new Resend();
    mockSend = resendInstance.emails.send as jest.Mock;
    mockSend.mockClear();
  });

  const validParams = {
    to: 'guest@example.com',
    guestName: 'Jane Doe',
    eventTitle: 'Wedding Anniversary',
    eventDate: '2025-08-20',
    eventTime: '19:00',
    location: 'Grand Hotel',
    description: 'Celebrating 10 years',
    inviteUrl: 'https://evite.example.com/invite/token456',
  };

  it('should successfully send an event update email', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'test-msg-id' } });

    const result = await sendEventUpdateEmail(validParams);

    expect(result.success).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: validParams.to,
        subject: `Event Updated: ${validParams.eventTitle}`,
        html: expect.stringContaining('Update Google Calendar'),
        text: expect.stringContaining(validParams.eventTitle),
      })
    );
  });

  it('should handle errors returned in the response object from Resend', async () => {
    mockSend.mockResolvedValueOnce({ error: { message: 'Rate limit exceeded' } });

    const result = await sendEventUpdateEmail(validParams);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Rate limit exceeded');
  });
});

describe('sendTestEmail', () => {
  let mockSend: jest.Mock;

  beforeEach(() => {
    // We can extract the mock implementation from the instantiated Resend object
    const resendInstance = new Resend();
    mockSend = resendInstance.emails.send as jest.Mock;
    mockSend.mockClear();
  });

  it('should successfully send a test email', async () => {
    const mockResponse = { id: 'test-msg-id', data: { id: 'test-msg-id' } };
    mockSend.mockResolvedValueOnce(mockResponse);

    const result = await sendTestEmail('test@example.com');

    expect(result.success).toBe(true);
    expect(result.response).toEqual(mockResponse);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: 'Test Email from Simple Evite',
        html: expect.any(String),
      })
    );
  });

  it('should handle errors returned in the response object from Resend (e.g., invalid API key)', async () => {
    const mockErrorResponse = { error: { message: 'Invalid API key' } };
    mockSend.mockResolvedValueOnce(mockErrorResponse);

    const result = await sendTestEmail('test@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid API key');
    expect(result.response).toEqual(mockErrorResponse);
  });

  it('should provide a default error message if Resend response error object lacks a message', async () => {
    const mockErrorResponse = { error: { name: 'UnknownResendError' } };
    mockSend.mockResolvedValueOnce(mockErrorResponse);

    const result = await sendTestEmail('test@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Email sending failed');
    expect(result.response).toEqual(mockErrorResponse);
  });

  it('should catch and handle Error objects thrown by Resend', async () => {
    const error = new Error('Network timeout');
    mockSend.mockRejectedValueOnce(error);

    const result = await sendTestEmail('test@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network timeout');
  });

  it('should catch and handle non-Error objects thrown by Resend', async () => {
    mockSend.mockRejectedValueOnce('Some string error');

    const result = await sendTestEmail('test@example.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown error');
  });
});
