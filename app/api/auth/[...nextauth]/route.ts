import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Create the handler with proper typing
const handler = NextAuth(authOptions);

// Export the handler with only the allowed HTTP methods
export { handler as GET, handler as POST };
