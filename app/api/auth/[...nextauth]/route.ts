import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Initialize NextAuth with the authentication options
const handler = NextAuth(authOptions);

// Export the handlers using the App Router pattern
export { handler as GET, handler as POST };
