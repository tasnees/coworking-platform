/**
 * Utility functions for URL handling
 */

const RENDER_URL = 'https://coworking-platform.onrender.com';

/**
 * Get the base URL for the application
 * In production, it will use (in order of priority):
 * 1. NEXT_PUBLIC_API_URL
 * 2. NEXTAUTH_URL
 * 3. RENDER_EXTERNAL_URL (with https://)
 * 4. Default Render URL
 */
export const getBaseUrl = (): string => {
  // In production, use the appropriate URL based on environment variables
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    if (process.env.NEXTAUTH_URL) {
      return process.env.NEXTAUTH_URL;
    }
    if (process.env.RENDER_EXTERNAL_URL) {
      return `https://${process.env.RENDER_EXTERNAL_URL}`;
    }
    return RENDER_URL;
  }
  // In development, use localhost
  return 'http://localhost:3000';
};

/**
 * Get the full API URL for a given path
 */
export const getApiUrl = (path: string = ''): string => {
  const base = getBaseUrl();
  // Remove trailing slash from base if present
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  // Add leading slash to path if not present
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

/**
 * Get the authentication URL for a given path
 */
export const getAuthUrl = (path: string = ''): string => {
  return getApiUrl(`/api/auth${path.startsWith('/') ? '' : '/'}${path}`);
};

// Log the current URL configuration (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('URL Configuration:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || RENDER_URL,
    RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL || 'Not set',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'Not set',
    baseUrl: getBaseUrl(),
    apiUrl: getApiUrl(),
    authUrl: getAuthUrl()
  });
}
