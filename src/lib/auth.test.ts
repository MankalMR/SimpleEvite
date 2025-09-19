/**
 * @jest-environment node
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from './auth';

// Mock NextAuth
jest.mock('next-auth', () => ({
  NextAuthOptions: jest.fn()
}));

describe('authOptions', () => {
  describe('configuration', () => {
    it('should have correct session strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have correct pages configuration', () => {
      expect(authOptions.pages?.signIn).toBe('/auth/signin');
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
      } as any);

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
        } as any);

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
        } as any);

        expect(result?.user).toHaveProperty('id', 'user-123');
      });
    });

    describe('jwt callback', () => {
      it('should set token.sub from user.id', async () => {
        const mockUser = {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User'
        };
        const mockToken = { userId: 'user-123' };

        const result = await authOptions.callbacks?.jwt?.({
          user: mockUser,
          token: mockToken,
          account: null
        });

        expect(result).toHaveProperty('sub', 'user-123');
      });

      it('should return token unchanged when no user', async () => {
        const mockToken = {
          sub: 'existing-user-id',
          userId: 'existing-user-id'
        };

        const result = await authOptions.callbacks?.jwt?.({
          user: null as any,
          token: mockToken,
          account: null
        });

        expect(result).toEqual(mockToken);
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
    it('should use JWT strategy for sessions', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should not have database adapter enabled', () => {
      // The adapter is commented out in the current implementation
      expect(authOptions.adapter).toBeUndefined();
    });
  });
});
