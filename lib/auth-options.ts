// lib/auth-options.ts
import { DefaultSession, NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { compare } from 'bcryptjs';

// Import the MongoDB client and types
import { MongoClient, MongoClientOptions } from 'mongodb';
import { 
  Adapter, 
  AdapterUser, 
  AdapterAccount, 
  VerificationToken 
} from 'next-auth/adapters';
import { getDb } from './db-utils';

// Import UserRole type from our centralized types
import { UserRole } from '@/types/next-auth';

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
  
  // Use a custom MongoDB adapter that uses a single 'users' collection
  adapter: {
  async getAdapter() {
    const { db, client } = await getDb();  // Destructure both db and client
      
    console.log('Using database for auth:', db.databaseName);
    
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
    
    // Rest of the adapter implementation...
      
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
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  // Configure JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key',
  },
  
  // Add callbacks for handling JWT, session, and redirects
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.id = user.id;
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
      
      return session;
    },
    
    async redirect({ url, baseUrl, token }: { url?: string; baseUrl: string; token?: { role?: UserRole } }) {
      // Helper to clean and validate URLs
      const getSafeRedirectUrl = (inputUrl: string | undefined) => {
        if (!inputUrl) return null;
        
        try {
          // Decode the URL first
          let decodedUrl = decodeURIComponent(inputUrl);
          
          // If the URL contains auth routes, it's likely part of a loop
          if (decodedUrl.includes('/auth/')) {
            // Try to extract the final destination if it's a nested callback
            const match = decodedUrl.match(/callbackUrl=([^&]*)/);
            if (match && match[1]) {
              const nestedUrl = decodeURIComponent(match[1]);
              if (!nestedUrl.includes('/auth/')) {
                return nestedUrl.startsWith(baseUrl) ? nestedUrl : `${baseUrl}${nestedUrl}`;
              }
            }
            return null;
          }
          
          // If it's a relative URL, prepend the base URL
          if (decodedUrl.startsWith('/')) {
            return `${baseUrl}${decodedUrl}`;
          }
          
          // If it's an absolute URL, ensure it's from the same origin
          if (decodedUrl.startsWith('http')) {
            const urlObj = new URL(decodedUrl);
            if (urlObj.origin === baseUrl) {
              return decodedUrl;
            }
          }
          
          return null;
        } catch (e) {
          console.error('Error processing redirect URL:', e);
          return null;
        }
      };

      // Try to get a safe redirect URL
      const safeUrl = getSafeRedirectUrl(url) || 
                     (token?.role ? `${baseUrl}${getDashboardPath(token.role)}` : baseUrl);

      console.log('Auth redirect:', { originalUrl: url, safeUrl });
      return safeUrl;
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