/**
 * Utility functions for URL handling
 */

export const getBaseUrl = (): string => {
  // In production, use NEXTAUTH_URL or RENDER_EXTERNAL_URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXTAUTH_URL || 
           process.env.RENDER_EXTERNAL_URL ? 
           `https://${process.env.RENDER_EXTERNAL_URL}` : 
           'https://coworking-platform.onrender.com';
  }
  // In development, use localhost
  return 'http://localhost:3000';
};

export const getApiUrl = (path: string = ''): string => {
  const base = getBaseUrl();
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const getAuthUrl = (path: string = ''): string => {
  return getApiUrl(`/api/auth${path.startsWith('/') ? '' : '/'}${path}`);
};

// Log the current URL configuration
console.log('URL Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
  RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL || 'not set',
  baseUrl: getBaseUrl(),
  apiUrl: getApiUrl(),
  authUrl: getAuthUrl()
});
