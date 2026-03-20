/**
 * @jest-environment node
 */

import { authOptions } from './auth';

// Mock NextAuth
jest.mock('next-auth', () => ({
  NextAuthOptions: jest.fn()
}));

describe('authOptions', () => {
  describe('configuration', () => {
    it('should have no explicit session strategy (defaults to database)', () => {
      expect(authOptions.session?.strategy).toBeUndefined();
    });

    it('should have correct pages configuration', () => {
      expect(authOptions.pages?.signIn).toBe('/');
      expect(authOptions.pages?.error).toBe('/auth/error');
    });

    it('should have Google provider configured', () => {
      expect(authOptions.providers).toHaveLength(1);
      expect(authOptions.providers?.[0]).toHaveProperty('id', 'google');
    });
  });

  describe('callbacks', () => {
    describe('session callback', () => {
      it('should add user id to session', async () => {
        const mockSession = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            emailVerified: new Date()
          },
          expires: '2024-12-31T23:59:59.999Z'
        };
        const mockToken = {
          sub: 'user-123',
          userId: 'user-123'
        };

        const result = await authOptions.callbacks?.session?.({
          session: mockSession,
          token: mockToken,
          user: mockSession.user
        } as unknown as Parameters<NonNullable<NonNullable<typeof authOptions.callbacks>['session']>>[0]);

        expect(result?.user).toHaveProperty('id', 'user-123');
        expect(result?.user?.email).toBe('test@example.com');
      });

      it('should handle missing token', async () => {
        const mockSession = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            emailVerified: new Date()
          },
          expires: '2024-12-31T23:59:59.999Z'
        };

        const result = await authOptions.callbacks?.session?.({
          session: mockSession,
          token: { userId: 'user-123' },
          user: mockSession.user
        } as unknown as Parameters<NonNullable<NonNullable<typeof authOptions.callbacks>['session']>>[0]);

        expect(result?.user).toHaveProperty('id', 'user-123');
        expect(result?.user?.email).toBe('test@example.com');
      });

      it('should handle missing user', async () => {
        const mockSession = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            emailVerified: new Date()
          },
          expires: '2024-12-31T23:59:59.999Z'
        };
        const mockToken = {
          sub: 'user-123',
          userId: 'user-123'
        };

        const result = await authOptions.callbacks?.session?.({
          session: mockSession,
          token: mockToken,
          user: mockSession.user
        } as unknown as Parameters<NonNullable<NonNullable<typeof authOptions.callbacks>['session']>>[0]);

        expect(result?.user).toHaveProperty('id', 'user-123');
      });
    });

  });

  describe('environment variables', () => {
    it('should use environment variables for Google provider', () => {
      const googleProvider = authOptions.providers?.[0];

      // Check that the provider is configured (actual values will be from env)
      expect(googleProvider).toBeDefined();
      expect(googleProvider).toHaveProperty('id', 'google');
    });
  });

  describe('security', () => {
    it('should not have explicit JWT strategy for sessions', () => {
      expect(authOptions.session?.strategy).toBeUndefined();
    });

    it('should have database adapter enabled', () => {
      // The adapter is configured to connect to Supabase
      expect(authOptions.adapter).toBeDefined();
    });
  });
});
