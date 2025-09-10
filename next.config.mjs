/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable App Router
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
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
  
  // Image optimization
  images: {
    // Enable optimization in production, disable in development
    unoptimized: process.env.NODE_ENV !== 'production',
    // Add any external image domains you need to optimize
    domains: [
      'coworking-platform.onrender.com',
      'localhost:3000',
      'localhost',
    ],
    // Enable AVIF format for better compression
    formats: ['image/avif', 'image/webp'],
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
  
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Production optimizations
  productionBrowserSourceMaps: false,
  
  // Configure webpack
  webpack: (config, { isServer }) => {
    // Add custom webpack configurations here if needed
    if (!isServer) {
      // Don't include certain packages in the client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
