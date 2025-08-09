/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint and TypeScript checks during build for CI/CD pipelines
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Consider removing this in production
  },
  
  // Image optimization
  images: {
    unoptimized: process.env.NODE_ENV !== 'production', // Enable optimization in production
    domains: [], // Add your image domains here
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
  
  // Output configuration
  output: 'standalone', // For Docker deployment
  
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Production optimizations
  productionBrowserSourceMaps: false, // Set to true for debugging in production
  // SWC minification is now enabled by default in Next.js
  
  // Configure webpack
  webpack: (config, { isServer }) => {
    // Add custom webpack configurations here if needed
    return config;
  },
};

export default nextConfig;
