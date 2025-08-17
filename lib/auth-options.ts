// lib/auth-options.ts
import { DefaultSession, NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { compare } from 'bcryptjs';
import { JWT } from 'next-auth/jwt';

// Import the MongoDB client and types
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from 'next-auth/adapters';

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
  
  // Use a custom MongoDB adapter that uses a single 'users' collection
  adapter: {
    async getAdapter() {
      const db = (await clientPromise).db();
      
      // Helper function to find a user by query in the users collection
      const findUser = async (query: any) => {
        try {
          const user = await db.collection('users').findOne(query);
          if (user) {
            return { ...user, id: user._id.toString() };
          }
          return null;
        } catch (error) {
          console.error('Error finding user:', error);
          return null;
        }
      };
      
      return {
        // User methods
        async createUser(user: Omit<AdapterUser, 'id'>) {
          // Get the role from the user object or default to 'member'
          const role = (user as any).role || 'member';
          
          // Ensure the role is one of the allowed roles
          const validRole = ['member', 'staff', 'admin'].includes(role) 
            ? role 
            : 'member';
            
          // Save to the users collection
          const result = await db.collection('users').insertOne({
            ...user,
            role: validRole,
            emailVerified: user.emailVerified || null,
            image: user.image || null,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          return { 
            ...user, 
            id: result.insertedId.toString(),
            role: validRole
          };
        },
        async getUser(id: string) {
          try {
            return await findUser({ _id: new ObjectId(id) });
          } catch (error) {
            console.error('Error getting user by ID:', error);
            return null;
          }
        },
        async getUserByEmail(email: string) {
          return await findUser({ email });
        },
        async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
          const account = await db.collection('accounts').findOne({
            providerAccountId,
            provider,
          });
          if (!account) return null;
          
          try {
            return await findUser({ _id: new ObjectId(account.userId) });
          } catch (error) {
            console.error('Error getting user by account:', error);
            return null;
          }
        },
        async updateUser(user: Partial<AdapterUser> & { id: string }) {
          const { id, ...update } = user;
          try {
            await db.collection('users').updateOne(
              { _id: new ObjectId(id) },
              { $set: update }
            );
            const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(id) });
            return updatedUser ? { ...updatedUser, id: updatedUser._id.toString() } : null;
          } catch (error) {
            console.error('Error updating user:', error);
            throw error;
          }
        },
        async deleteUser(userId: string) {
          try {
            await Promise.all([
              db.collection('users').deleteOne({ _id: new ObjectId(userId) }),
              db.collection('sessions').deleteMany({ userId }),
              db.collection('accounts').deleteMany({ userId }),
            ]);
          } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
          }
        },
        
        // Session methods
        async createSession(session: { sessionToken: string; userId: string; expires: Date }) {
          try {
            await db.collection('sessions').insertOne(session);
            return session;
          } catch (error) {
            console.error('Error creating session:', error);
            throw error;
          }
        },
        async getSessionAndUser(sessionToken: string) {
          try {
            const session = await db.collection('sessions').findOne({ sessionToken });
            if (!session) return null;
            
            const user = await db.collection('users').findOne({ _id: new ObjectId(session.userId) });
            if (!user) return null;
            
            return {
              session: {
                ...session,
                userId: user._id.toString(),
              },
              user: {
                ...user,
                id: user._id.toString(),
              },
            };
          } catch (error) {
            console.error('Error getting session and user:', error);
            return null;
          }
        },
        async updateSession(session: { sessionToken: string }) {
          try {
            const result = await db.collection('sessions').findOneAndUpdate(
              { sessionToken: session.sessionToken },
              { $set: session },
              { returnDocument: 'after' }
            );
            if (!result || !result.value) {
              throw new Error('Failed to update session: No result returned');
            }
            return result.value;
          } catch (error) {
            console.error('Error updating session:', error);
            throw error;
          }
        },
        async deleteSession(sessionToken: string) {
          try {
            await db.collection('sessions').deleteOne({ sessionToken });
          } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
          }
        },
        
        // Account methods
        async linkAccount(account: AdapterAccount) {
          await db.collection('accounts').insertOne(account);
          return account;
        },
        async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
          await db.collection('accounts').deleteOne({ providerAccountId, provider });
        },
        
        // Verification token methods
        async createVerificationToken(verificationToken: VerificationToken) {
          await db.collection('verification_tokens').insertOne(verificationToken);
          return verificationToken;
        },
        async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
          const result = await db.collection('verification_tokens').findOneAndDelete({
            identifier,
            token,
          });
          if (!result) {
            return null;
          }
          return result.value;
        },
      };
    },
  } as Adapter,
  
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