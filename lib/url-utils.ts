/**
 * Utility functions for URL handling
 */

const VERCEL_URL = 'https://coworking-platform-smoky.vercel.app';

export const getBaseUrl = (): string => {
  // In production, use NEXT_PUBLIC_API_URL or NEXTAUTH_URL or Vercel URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || 
           process.env.NEXTAUTH_URL || 
           VERCEL_URL;
  }
  // In development, use localhost
  return 'http://localhost:3000';
};

export const getApiUrl = (path: string = ''): string => {
  const base = getBaseUrl();
  // Remove trailing slash from base if present
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  // Add leading slash to path if not present
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

export const getAuthUrl = (path: string = ''): string => {
  return getApiUrl(`/api/auth${path.startsWith('/') ? '' : '/'}${path}`);
};

// Log the current URL configuration (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('URL Configuration:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || VERCEL_URL,
    VERCEL_URL: process.env.VERCEL_URL || 'Not set',
    RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL || 'Not set',
    baseUrl: getBaseUrl(),
    apiUrl: getApiUrl(),
    authUrl: getAuthUrl()
  });
}
