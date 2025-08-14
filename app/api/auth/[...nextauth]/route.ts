import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Initialize NextAuth with the authentication options
const handler = NextAuth({
  ...authOptions,
  // Add any additional options here if needed
  logger: {
    error(code, metadata) {
      console.error('NextAuth error:', { code, metadata });
    },
    warn(code) {
      console.warn('NextAuth warning:', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('NextAuth debug:', { code, metadata });
      }
    },
  },
});

// Export the handler with only the allowed HTTP methods
export { handler as GET, handler as POST };
