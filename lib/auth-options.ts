// lib/auth-options.ts
import { DefaultSession, NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { compare } from 'bcryptjs';
import { JWT } from 'next-auth/jwt';
import { Adapter } from 'next-auth/adapters';

// Import the MongoDB client promise
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const client = new MongoClient(uri);
const clientPromise = client.connect();

// Define user roles and type guard
type UserRole = 'admin' | 'staff' | 'member';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

// Define the shape of the user document in MongoDB
interface IUserDocument {
  _id: any;
  email: string;
  name?: string;
  password: string;
  role: UserRole;
  emailVerified?: Date | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Configuration for NextAuth.js with Credentials provider
 */
export const authOptions: NextAuthOptions = {
  // Configure credentials provider
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password');
        }

        try {
          // Find user by email in any collection
          const client = await clientPromise;
          const db = client.db('users');
          
          // Check each collection for the user
          const collections = ['admin', 'staff', 'member'];
          let userDoc = null;
          let userRole: UserRole = 'member';
          
          for (const collection of collections) {
            const doc = await db.collection(collection).findOne<{
              _id: any;
              email: string;
              password: string;
              name?: string;
              role?: UserRole;
            }>({ 
              email: credentials.email 
            });
            
            if (doc) {
              userDoc = doc;
              userRole = doc.role || (collection as UserRole);
              break;
            }
          }

          // Check if user exists
          if (!userDoc) {
            throw new Error('No user found with this email');
          }

          // Check if password is correct
          const isValid = await compare(credentials.password, userDoc.password);
          if (!isValid) {
            throw new Error('Incorrect password');
          }

          // Return user object without the password
          // Return user data with role
          return {
            id: userDoc._id.toString(),
            email: userDoc.email,
            name: userDoc.name || null,
            role: userRole,
          } as User;
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  
  // Use MongoDB adapter for sessions
  adapter: MongoDBAdapter({
    ...clientPromise,
    // Override the database name to 'users' to match your setup
    databaseName: 'users',
  }) as unknown as Adapter, // Type assertion for MongoDBAdapter
  
  // Configure session settings
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Configure JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key',
  },
  
  // Custom pages
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  
  // Callbacks for JWT and session
  callbacks: {
    async jwt({ token, user }) {
      // Add user role to the JWT token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'member';
      }
      return token;
    },
    
    async session({ session, token }) {
      // Add user role to the session
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
};