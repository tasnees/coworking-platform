import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    role: "admin" | "staff" | "member"
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: "admin" | "staff" | "member"
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: "admin" | "staff" | "member"
  }
}
