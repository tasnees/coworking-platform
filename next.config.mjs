/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict routing in production
  trailingSlash: false,
  
  // Base path configuration (if app is not at root)
  // basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  
  // Asset prefix for CDN support
  // assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
  
  // Disable ESLint and TypeScript checks during build for CI/CD pipelines
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Consider removing this in production
  },
  
  // Image optimization
  images: {
    unoptimized: process.env.NODE_ENV !== 'production',
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
  output: 'standalone',
  
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
