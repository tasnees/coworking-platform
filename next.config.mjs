/** @type {import('next').NextConfig} */
const nextConfig = {
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
