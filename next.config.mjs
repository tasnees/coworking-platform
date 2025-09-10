/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables that should be exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    // Add other client-side environment variables here
  },
  
  // Server-side environment variables
  serverRuntimeConfig: {
    // Will only be available on the server side
    authSecret: process.env.NEXTAUTH_SECRET,
    jwtSecret: process.env.JWT_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  },
  
  // Public runtime config (exposed to both server and client)
  publicRuntimeConfig: {
    // Available on both server and client
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
  },
  // Enable strict routing in production
  trailingSlash: false,
  
  // Disable static exports for API routes
  output: process.env.NODE_ENV === 'production' ? 'export' : 'standalone',
  
  // Disable image optimization for static exports
  images: {
    unoptimized: true,
    domains: [],
  },
  
  // Disable ESLint and TypeScript checks during build for CI/CD pipelines
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Consider removing this in production
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Skip API routes during static export
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/auth/login': { page: '/auth/login' },
      '/auth/register': { page: '/auth/register' },
      '/auth/forgot-password': { page: '/auth/forgot-password' },
      '/auth/reset-password/[token]': { page: '/auth/reset-password/[token]' },
      // Add other static pages here
    };
  },
  
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Production optimizations
  productionBrowserSourceMaps: false,
  
  // Configure webpack
  webpack: (config, { isServer }) => {
    // Add custom webpack configurations here if needed
    return config;
  },
};

export default nextConfig;
