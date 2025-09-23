import type { User } from 'next-auth';
import { Collection, Db, Document, ObjectId, WithId, WithoutId } from 'mongodb';
import type { Adapter, AdapterAccount, AdapterSession, AdapterUser, VerificationToken } from 'next-auth/adapters';
import clientPromise from '@/lib/mongodb';

// Extend the AdapterUser type to include our custom fields
declare module 'next-auth/adapters' {
  interface AdapterUser {
    id: string;
    email: string;
    emailVerified: Date | null;
    name?: string | null;
    image?: string | null;
    role: string;
  }
}

// Type-safe function to convert account types
function toValidAccountType(type: string): 'email' | 'oauth' | 'credentials' {
  if (type === 'oidc') return 'oauth';
  if (type === 'email' || type === 'oauth' || type === 'credentials') return type;
  return 'oauth'; // Default to oauth for any other type
}

// Define our database document interfaces
interface UserDocument {
  _id: ObjectId;
  name?: string | null;
  email: string; // Email is required in the database
  emailVerified: Date | null;
  image?: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AccountDocument {
  _id: ObjectId;
  userId: ObjectId;
  type: 'oauth' | 'email' | 'credentials' | 'oidc';
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SessionDocument {
  _id: ObjectId;
  sessionToken: string;
  userId: ObjectId;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface VerificationTokenDocument {
  _id: ObjectId;
  identifier: string;
  token: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Singleton pattern for MongoDB collections
let collections: {
  users: Collection<UserDocument>;
  accounts: Collection<AccountDocument>;
  sessions: Collection<SessionDocument>;
  verificationTokens: Collection<VerificationTokenDocument>;
} | null = null;

async function getCollections() {
  if (!collections) {
    const client = await clientPromise;
    const db = client.db();
    
    if (!db) {
      throw new Error('Failed to connect to MongoDB');
    }
    
    collections = {
      users: db.collection<UserDocument>('users'),
      accounts: db.collection<AccountDocument>('accounts'),
      sessions: db.collection<SessionDocument>('sessions'),
      verificationTokens: db.collection<VerificationTokenDocument>('verification_tokens')
    };
  }
  return collections;
}

export default async function MongoDBAdapter(): Promise<Adapter> {

  // Helper function to safely get collections
  const getSafeCollections = async () => {
    const collections = await getCollections();
    if (!collections) {
      throw new Error('Database collections not initialized');
    }
    return collections;
  };

  // Create indexes if they don't exist
  const createIndexes = async () => {
    try {
      const { users, accounts, sessions, verificationTokens } = await getSafeCollections();
      
      await Promise.all([
        users.createIndex(
          { email: 1 },
          { unique: true, name: 'email_unique' }
        ),
        accounts.createIndex(
          { provider: 1, providerAccountId: 1 },
          { unique: true, name: 'provider_providerAccountId_unique' }
        ),
        sessions.createIndex(
          { sessionToken: 1 },
          { unique: true, name: 'sessionToken_unique' }
        ),
        verificationTokens.createIndex(
          { identifier: 1, token: 1 },
          { unique: true, name: 'identifier_token_unique' }
        ),
      ]);
    } catch (error) {
      console.error('Error creating indexes:', error);
      // Don't throw here as the app might still work without indexes
    }
  };

  // Initialize indexes
  await createIndexes();
    
  return {
      // Create a new user
      async createUser(userData: Omit<AdapterUser, 'id'>): Promise<AdapterUser> {
        if (!userData.email) {
          throw new Error('Email is required');
        }
        
        const { users } = await getCollections();
        const now = new Date();
        const emailVerified = userData.emailVerified || null;
        
        try {
          const newUser: UserDocument = {
            _id: new ObjectId(),
            name: userData.name || null,
            email: userData.email,
            emailVerified: emailVerified ? new Date(emailVerified) : null,
            image: userData.image || null,
            role: 'user', // Default role
            createdAt: now,
            updatedAt: now,
          };
          
          const { users } = await getCollections();
          const result = await users.insertOne(newUser);
          
          if (!result.acknowledged || !result.insertedId) {
            throw new Error('Failed to create user');
          }
          
            // Return the created user in the format expected by NextAuth
          const adapterUser: AdapterUser = {
            id: result.insertedId.toString(),
            email: newUser.email,
            emailVerified: newUser.emailVerified,
            name: newUser.name || null,
            image: newUser.image || null,
            role: 'user',
          };
          
          return adapterUser;
        } catch (error) {
          console.error('Error creating user:', error);
          throw new Error('Failed to create user');
        }
      },
      
      // Get a user by ID
      async getUser(id: string): Promise<AdapterUser | null> {
        try {
          const { users } = await getCollections();
          const user = await users.findOne({ _id: new ObjectId(id) });
          if (!user) return null;
          
          // Ensure email is properly handled as it's required in our schema
          if (!user.email) {
            console.error('User found without email:', user._id);
            return null;
          }
          
          return {
            id: user._id.toString(),
            name: user.name || null,
            email: user.email, // Required field
            emailVerified: user.emailVerified,
            image: user.image || null,
            role: user.role || 'user',
          };
        } catch (error) {
          console.error('Error getting user by ID:', error);
          return null;
        }
      },
      
      // Get a user by email
      async getUserByEmail(email: string | null): Promise<AdapterUser | null> {
        if (!email) return null;
        
        try {
          const { users } = await getSafeCollections();
          const user = await users.findOne({ email });
          if (!user) return null;
          
          // Email should always be present as it's required
          if (!user.email) {
            console.error('User found without email:', user._id);
            return null;
          }
          
          return {
            id: user._id.toString(),
            name: user.name || null,
            email: user.email, // Required field
            emailVerified: user.emailVerified,
            image: user.image || null,
            role: user.role || 'user',
          };
        } catch (error) {
          console.error('Error getting user by email:', error);
          return null;
        }
      },
      
      // Get a user by account (provider and provider account ID)
      async getUserByAccount(providerAccountId: { provider: string; providerAccountId: string; }): Promise<AdapterUser | null> {
        try {
          const { accounts, users } = await getSafeCollections();
          const account = await accounts.findOne({
            provider: providerAccountId.provider,
            providerAccountId: providerAccountId.providerAccountId,
          });
          
          if (!account) return null;
          
          const user = await users.findOne({ 
            _id: new ObjectId(account.userId) 
          });
          
          if (!user) return null;
          
          // Email should always be present as it's required
          if (!user.email) {
            console.error('User found without email:', user._id);
            return null;
          }
          
          return {
            id: user._id.toString(),
            name: user.name || null,
            email: user.email, // Required field
            emailVerified: user.emailVerified,
            image: user.image || null,
            role: user.role || 'user',
          };
        } catch (error) {
          console.error('Error getting user by account:', error);
          return null;
        }
      },
      
      // Update a user
      async updateUser(user: Partial<AdapterUser> & { id: string }): Promise<AdapterUser> {
        try {
          const { users } = await getSafeCollections();
          const userId = new ObjectId(user.id);
          const update: Partial<UserDocument> = { updatedAt: new Date() };
          
          if (user.name !== undefined) update.name = user.name;
          if (user.email !== undefined) update.email = user.email;
          if (user.image !== undefined) update.image = user.image;
          if (user.emailVerified !== undefined) update.emailVerified = user.emailVerified ? new Date(user.emailVerified) : null;
          
          const result = await users.findOneAndUpdate(
            { _id: userId },
            { $set: update },
            { returnDocument: 'after' }
          ).then(res => res.value as UserDocument | null);
          
          if (!result) {
            throw new Error('User not found');
          }
          
          const updatedUser = result;
          
          return {
            id: updatedUser._id.toString(),
            email: updatedUser.email,
            emailVerified: updatedUser.emailVerified ?? null,
            name: updatedUser.name ?? null,
            image: updatedUser.image ?? null,
            role: updatedUser.role,
          };
        } catch (error) {
          console.error('Error updating user:', error);
          throw error;
        }
      },
      
      // Create a new account
      async linkAccount(account: { userId: string; provider: string; providerAccountId: string; refresh_token?: string; access_token?: string; expires_at?: number; token_type?: string; scope?: string; id_token?: string; session_state?: string; }): Promise<void> {
        try {
          const { accounts } = await getSafeCollections();
          const now = new Date();
          const accountDoc: AccountDocument = {
            _id: new ObjectId(),
            userId: new ObjectId(account.userId),
            type: toValidAccountType('oauth'), // Default to 'oauth' as we don't have the type in the account object
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
            createdAt: now,
            updatedAt: now,
          };
          
          await accounts.insertOne(accountDoc);
        } catch (error) {
          console.error('Error linking account:', error);
          throw error;
        }
      },
      
      // Create a session
      async createSession(session: { sessionToken: string; userId: string; expires: Date; }): Promise<AdapterSession> {
        const { sessions, users } = await getSafeCollections();
        const now = new Date();
        const userId = new ObjectId(session.userId);
        
        try {
          // Verify the user exists
          const user = await users.findOne({ _id: userId });
          if (!user) {
            throw new Error(`User not found with ID: ${session.userId}`);
          }
          
          const sessionDoc: SessionDocument = {
            _id: new ObjectId(),
            sessionToken: session.sessionToken,
            userId: userId,
            expires: session.expires,
            createdAt: now,
            updatedAt: now,
          };
          
          await sessions.insertOne(sessionDoc);
          
          return {
            sessionToken: session.sessionToken,
            userId: session.userId,
            expires: session.expires,
          };
        } catch (error) {
          console.error('Error creating session:', error);
          throw error;
        }
      },
      
      // Get a session by session token
      async getSessionAndUser(sessionToken: string) {
        try {
          const { sessions, users } = await getSafeCollections();
          const session = await sessions.findOne({ 
            sessionToken 
          });
          
          if (!session) return null;
          
          const user = await users.findOne({ 
            _id: new ObjectId(session.userId) 
          });
          
          if (!user) return null;
          
          // Ensure email is properly handled as it's required in our schema
          if (!user.email) {
            console.error('User found without email:', user._id);
            return null;
          }
          
          const adapterUser: AdapterUser = {
            id: user._id.toString(),
            name: user.name || null,
            email: user.email, // Required field
            emailVerified: user.emailVerified,
            image: user.image || null,
            role: user.role || 'user',
          };
          
          return {
            user: adapterUser,
            session: {
              sessionToken: session.sessionToken,
              userId: session.userId.toString(),
              expires: session.expires,
            },
          };
        } catch (error) {
          console.error('Error getting session and user:', error);
          return null;
        }
      },
      
      // Update a session
      async updateSession(session: Partial<AdapterSession> & { sessionToken: string }): Promise<AdapterSession | null> {
        try {
          const { sessions } = await getSafeCollections();
          const now = new Date();
          const update: Partial<SessionDocument> = {
            updatedAt: now,
          };
          
          // Only update expires if provided
          if (session.expires) {
            update.expires = session.expires;
          }
          
          const result = await sessions.findOneAndUpdate(
            { sessionToken: session.sessionToken },
            { $set: update },
            { returnDocument: 'after' }
          ).then(res => res.value as SessionDocument | null);
          
          if (!result) {
            console.error('Session not found for update:', session.sessionToken);
            return null;
          }
          
          const updatedSession = result;
          
          return {
            sessionToken: updatedSession.sessionToken,
            userId: updatedSession.userId.toString(),
            expires: updatedSession.expires,
          };
        } catch (error) {
          console.error('Error updating session:', error);
          return null;
        }
      },
      
      // Delete a session
      async deleteSession(sessionToken: string): Promise<void> {
        try {
          const { sessions } = await getSafeCollections();
          const result = await sessions.deleteOne({ sessionToken });
          
          if (result.deletedCount === 0) {
            console.warn('No session found to delete with token:', sessionToken);
          }
        } catch (error) {
          console.error('Error deleting session:', error);
          throw error;
        }
      },
      
      // Create a verification token
      async createVerificationToken(verificationToken: VerificationToken): Promise<VerificationToken> {
        try {
          const { verificationTokens } = await getCollections();
          const now = new Date();
          const expires = new Date(verificationToken.expires);
          
          if (isNaN(expires.getTime())) {
            throw new Error('Invalid expiration date for verification token');
          }
          
          const tokenDoc: VerificationTokenDocument = {
            _id: new ObjectId(),
            identifier: verificationToken.identifier,
            token: verificationToken.token,
            expires: expires,
            createdAt: now,
            updatedAt: now,
          };
          
          await verificationTokens.insertOne(tokenDoc);
          
          return {
            identifier: tokenDoc.identifier,
            token: tokenDoc.token,
            expires: tokenDoc.expires, // Keep as Date object to match the interface
          };
        } catch (error) {
          console.error('Error creating verification token:', error);
          throw error;
        }
      },
      
      // Use a verification token
      async useVerificationToken(params: { 
        identifier: string; 
        token: string; 
      }): Promise<VerificationToken | null> {
        const { verificationTokens: tokens } = await getCollections();
        
        try {
          // First find the token
          const tokenDoc = await tokens.findOne({
            identifier: params.identifier,
            token: params.token,
          });
          
          if (!tokenDoc) {
            console.log('Verification token not found or already used:', params.identifier);
            return null;
          }
          
          // Check if token is expired
          if (new Date() > tokenDoc.expires) {
            console.log('Verification token expired:', params.identifier);
            // Delete the expired token using the existing tokens variable
            await tokens.deleteOne({
              _id: tokenDoc._id
            });
            return null;
          }
          
          // Delete the token after successful verification
          await tokens.deleteOne({
            _id: tokenDoc._id
          });
          
          return {
            identifier: tokenDoc.identifier,
            token: tokenDoc.token,
            expires: tokenDoc.expires,
          };
        } catch (error) {
          console.error('Error using verification token:', error);
          return null;
        }
      },
    };
}
