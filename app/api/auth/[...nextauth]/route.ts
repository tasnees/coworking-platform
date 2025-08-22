import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Initialize NextAuth with the authentication options
const handler = NextAuth(authOptions);

// Export the handlers using the App Router pattern
export { handler as GET, handler as POST };

// No dynamic export - let Next.js handle the optimization
// export const dynamic = 'force-dynamic';

export default handler;
