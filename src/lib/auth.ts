import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { SupabaseAdapter } from '@auth/supabase-adapter';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      httpOptions: {
        timeout: 10000,
      },
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock_key_for_build',
  }) as NonNullable<NextAuthOptions['adapter']>,
  callbacks: {
    session: async ({ session, user }) => {
      console.log('--- NextAuth Session Callback ---');
      console.log('User from DB:', user);
      console.log('Session before update:', session);
      
      if (session?.user && user) {
        (session.user as { id: string }).id = user.id;
        console.log('User ID mapped to session:', user.id);
      } else {
        console.warn('Session update skipped: session.user or user is missing');
      }
      
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
};
