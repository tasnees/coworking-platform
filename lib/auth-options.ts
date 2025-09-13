// lib/auth-options.ts
import { DefaultSession, NextAuthOptions, User } from 'next-auth';
import type { Adapter, AdapterUser } from 'next-auth/adapters';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { MongoClient, type MongoClientOptions } from 'mongodb';
import { MongoDBAdapter as BaseMongoDBAdapter } from '@auth/mongodb-adapter';
import { getDb } from './db-utils';
import type { UserRole } from '@/lib/auth-types';

// Extend the base adapter types to include role
type AdapterUserWithRole = AdapterUser & {
  role?: UserRole;
  [key: string]: unknown;
};

// Create a typed MongoDB adapter
const MongoDBAdapter = (clientPromise: Promise<MongoClient>): Adapter => {
  const baseAdapter = BaseMongoDBAdapter(clientPromise);
  
  return {
    ...baseAdapter,
    // @ts-ignore - We're extending the base adapter with role support
    async getUser(id: string) {
      if (!baseAdapter.getUser) return null;
      const user = await baseAdapter.getUser(id);
      return user ? { ...user, role: (user as any).role || 'member' } : null;
    },
    // @ts-ignore - We're extending the base adapter with role support
    async getUserByEmail(email: string) {
      if (!(baseAdapter as any).getUserByEmail) return null;
      const user = await (baseAdapter as any).getUserByEmail(email);
      return user ? { ...user, role: (user as any).role || 'member' } : null;
    },
    // @ts-ignore - We're extending the base adapter with role support
    async getUserByAccount(providerAccountId: { provider: string; providerAccountId: string }) {
      if (!(baseAdapter as any).getUserByAccount) return null;
      const user = await (baseAdapter as any).getUserByAccount(providerAccountId);
      return user ? { ...user, role: (user as any).role || 'member' } : null;
    },
  } as Adapter;
};


// Enable debug logging
const debug = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';
const log = (...args: any[]) => debug && console.log('[NextAuth]', ...args);

// Import URL utilities
import { getBaseUrl } from './url-utils';
import { getDashboardPath } from '@/lib/utils/routes';

// Get environment variables
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Set up the base URL for NextAuth
const baseUrl = getBaseUrl();

// Set default NEXTAUTH_URL for production
const renderUrl = 'https://coworking-platform.onrender.com';

// Log the base URL for debugging
log(`Base URL set to: ${baseUrl}`);
log(`NODE_ENV: ${process.env.NODE_ENV}`);
log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || renderUrl}`);
log(`RENDER_EXTERNAL_URL: ${process.env.RENDER_EXTERNAL_URL || 'https://coworking-platform.onrender.com'}`);

// Ensure we have a valid NEXTAUTH_URL in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXTAUTH_URL) {
    // If NEXTAUTH_URL is not set, use the Render URL
    process.env.NEXTAUTH_URL = process.env.RENDER_EXTERNAL_URL 
      ? `https://${process.env.RENDER_EXTERNAL_URL}`
      : renderUrl;
    console.log(`ℹ️ Set NEXTAUTH_URL to ${process.env.NEXTAUTH_URL} (Render deployment)`);
  } else if (process.env.NEXTAUTH_URL.includes('localhost')) {
    // If NEXTAUTH_URL points to localhost, update to Render URL
    process.env.NEXTAUTH_URL = renderUrl;
    console.log(`ℹ️ Updated NEXTAUTH_URL to Render deployment: ${process.env.NEXTAUTH_URL}`);
  }
}

// MongoDB connection options
const mongoOptions: MongoClientOptions = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  retryWrites: true,
  w: 'majority',
  tls: uri.startsWith('mongodb+srv'),
  serverApi: {
    version: '1' as const,
    strict: false,
    deprecationErrors: true,
  }
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

try {
  client = new MongoClient(uri, mongoOptions);
  clientPromise = client.connect();
  
  // Log successful connection
  clientPromise.then(() => {
    console.log('✅ Successfully connected to MongoDB');
  }).catch((error) => {
    console.error('❌ Failed to connect to MongoDB:', error);
  });
} catch (error) {
  console.error('❌ Failed to create MongoDB client:', error);
  throw error;
}

// Define the shape of the user document in MongoDB
interface IUserDocument {
  _id: unknown;
  email: string;
  name?: string;
  password: string;
  role: UserRole;
  status?: 'active' | 'inactive' | 'suspended';
  emailVerified?: Date | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Configuration for NextAuth.js with Credentials provider
 */
export const authOptions: NextAuthOptions = {
  // Authentication endpoints will be available at /api/auth/* by default
  // Configure cookies for production with CORS support
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined,
      }
    }
  },
  // Configure credentials provider
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        log('Authorize called with credentials:', { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          log('Missing credentials');
          throw new Error('Please enter your email and password');
        }

        try {
          // Find user by email in the users collection
          const client = await clientPromise;
          const db = client.db('coworking-platform');
          
          // Find user in the users collection
          const userDoc = await db.collection('users').findOne<{
            _id: any;
            email: string;
            password: string;
            name?: string;
            role: UserRole;
            status?: 'active' | 'inactive' | 'suspended';
          }>({ 
            email: credentials.email.toLowerCase().trim()
          });
          
          // If no user found, throw error
          if (!userDoc) {
            log('No user found with email:', credentials.email);
            throw new Error('No user found with this email');
          }
          
          // Check if user is active
          if (userDoc.status !== 'active') {
            log('Login attempt for non-active account:', {
              email: credentials.email,
              status: userDoc.status
            });
            throw new Error('This account is not active. Please contact support.');
          }

          // Check if password is correct
          const isValid = await compare(credentials.password, userDoc.password);
          if (!isValid) {
            log('Invalid password attempt for email:', credentials.email);
            throw new Error('Incorrect password');
          }

          // Verify the user has a valid role
          if (!userDoc.role || !['member', 'staff', 'admin'].includes(userDoc.role)) {
            log('User has invalid role:', { email: credentials.email, role: userDoc.role });
            throw new Error('Your account has an invalid role. Please contact support.');
          }

          // Log successful login
          log('User authenticated successfully:', { email: userDoc.email, role: userDoc.role });

          // Update last login timestamp
          await db.collection('users').updateOne(
            { _id: userDoc._id },
            { $set: { lastLoginAt: new Date() } }
          );

          // Return user object without the password
          return {
            id: userDoc._id.toString(),
            email: userDoc.email,
            name: userDoc.name || null,
            role: userDoc.role,
          } as User;
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  
  // Configure MongoDB adapter with client promise
  adapter: MongoDBAdapter(clientPromise),
  
  // Configure session settings
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session age daily
  },
  
  // Configure JWT settings
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 's+JYLbbzVaJoBeaQawj42O1QGAAxMR8VL/W0oee9IEo=',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Add callbacks for handling JWT, session, and redirects
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.id = user.id;
        // Set a far future expiration (year 2100)
        token.exp = Math.floor(new Date('2100-01-01').getTime() / 1000);
      } else if (token.exp) {
        // If token already has an expiration, extend it
        token.exp = Math.floor(Date.now() / 1000) + (100 * 365 * 24 * 60 * 60);
      }
      return token;
    },
    
    async session({ session, token }) {
      // Ensure user object exists
      if (!session.user) {
        session.user = {} as any;
      }
      
      // Add role and ID to the session
      if (token.role) {
        session.user.role = token.role as UserRole;
      } else {
        // Default role if not set
        session.user.role = 'member';
      }
      
      if (token.id) {
        session.user.id = token.id as string;
      }
      
      // Ensure the session has all required fields
      session.user.name = session.user.name || token.name || '';
      session.user.email = session.user.email || token.email || '';
      
      // Set a far future expiration for the session cookie
      if (session.expires) {
        session.expires = new Date('2100-01-01').toISOString();
      }
      
      return session;
    },
    
    async redirect({ url, baseUrl, token }: { url?: string; baseUrl: string; token?: { role?: UserRole } }) {
      // If this is a sign-in callback, redirect to the dashboard if authenticated
      if (url?.includes('/api/auth/signin')) {
        return token?.role ? `${baseUrl}${getDashboardPath(token.role)}` : `${baseUrl}/auth/login`;
      }

      // For all other cases, respect the callback URL or redirect to the dashboard
      if (url?.startsWith(baseUrl) || !url?.startsWith('http')) {
        // If there's a valid callback URL, use it
        const callbackUrl = new URL(url || '/', baseUrl);
        const callbackPath = callbackUrl.pathname;
        
        // Don't redirect back to auth pages if already authenticated
        if (token?.role && callbackPath.startsWith('/auth/')) {
          return `${baseUrl}${getDashboardPath(token.role)}`;
        }
        
        // Otherwise, use the callback URL or go to dashboard
        return token?.role && callbackPath === '/'
          ? `${baseUrl}${getDashboardPath(token.role)}`
          : callbackUrl.toString();
      }
      
      // Fallback to the dashboard if authenticated, or home if not
      return token?.role 
        ? `${baseUrl}${getDashboardPath(token.role)}`
        : `${baseUrl}/home`;
    }
  },
  
  // Custom pages
  pages: {
    signIn: '/auth/login',
    signOut: '/',  // Redirect to home after sign out
    error: '/auth/error',
  },
  
  // Ensure sign out redirects to home page
  events: {
    async signOut(message) {
      // This ensures the user is redirected to the home page after sign out
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },
  },
  
  debug: debug,
  logger: {
    error(code, metadata) {
      console.error('NextAuth error:', code, JSON.stringify(metadata, null, 2));
    },
    warn(code) {
      console.warn('NextAuth warning:', code);
    },
    debug(code, metadata) {
      if (debug) {
        console.debug('NextAuth debug:', code, JSON.stringify(metadata, null, 2));
      }
    }
  },
};