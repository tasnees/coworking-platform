import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Application
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  
  // Database
  MONGODB_URI: z.string().url(),
  MONGODB_DB: z.string(),
  
  // Authentication
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // NextAuth
  NEXTAUTH_DEBUG: z.string().optional().transform((val: string | undefined) => val === 'true'),
  
  // Deployment
  VERCEL_URL: z.string().optional(),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  
  // Feature Flags
  ENABLE_ANALYTICS: z.string().optional().default('false').transform((val: string) => val === 'true'),
  
  // API Keys
  RESEND_API_KEY: z.string().optional(),
  
  // Optional with defaults
  PORT: z.string().default('3000').transform(Number),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});

// Validate environment variables
const _env = envSchema.safeParse(process.env);

// Throw an error if validation fails
if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
  throw new Error('Invalid environment variables');
}

// Export validated environment variables
export const env = _env.data;

// Log environment in development
if (env.NODE_ENV === 'development') {
  console.log('Environment variables loaded successfully');
}

// Export type for type safety
export type Env = typeof env;
