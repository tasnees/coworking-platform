import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// This is a mock database - replace with your actual database
const users = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    password: "$2a$10$XKvT7y4Z4d2K8x8vH5k9uO9zY3x8vH5k9uO9zY3x8vH5k9uO9zY3x8v", // password: admin123
    role: "admin" as const,
  },
  {
    id: "2",
    email: "staff@example.com",
    name: "Staff User",
    password: "$2a$10$XKvT7y4Z4d2K8x8vH5k9uO9zY3x8vH5k9uO9zY3x8vH5k9uO9zY3x8v", // password: staff123
    role: "staff" as const,
  },
  {
    id: "3",
    email: "member@example.com",
    name: "Member User",
    password: "$2a$10$XKvT7y4Z4d2K8x8vH5k9uO9zY3x8vH5k9uO9zY3x8vH5k9uO9zY3x8v", // password: member123
    role: "member" as const,
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user in database
        const user = users.find(u => u.email === credentials.email)
        
        if (!user) {
          return null
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Return a properly typed User object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as "admin" | "staff" | "member"
      }
      return session
    }
  }
}
