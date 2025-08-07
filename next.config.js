/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable App Router and experimental features
  experimental: {
    appDir: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Enable server components external packages
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    // Enable ISR memory cache configuration
    isrMemoryCacheSize: 0, // Disable in-memory cache in favor of file-system cache
  },
  
  // TypeScript configuration
  typescript: {
    // Enable type checking during build process
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    // Allow production builds to complete with ESLint warnings
    ignoreDuringBuilds: true,
  },
  
  // Image optimization
  images: {
    unoptimized: process.env.NODE_ENV !== 'production', // Enable optimization in production
    domains: [
      'localhost',
      'coworking-platform.onrender.com',
      // Add other domains as needed
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
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
  
  // Enable production source maps
  productionBrowserSourceMaps: false, // Set to true for debugging in production
  
  // Enable SWC minification
  swcMinify: true,
  
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Enable etags for better caching
  generateEtags: true,
  
  // Disable trailing slashes
  trailingSlash: false,
  
  // Disable powered by header for security
  poweredByHeader: false,

  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Add custom webpack configurations here if needed
    if (!dev && !isServer) {
      // Enable optimizations for production client bundle
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 10,
        minSize: 0,
        cacheGroups: {
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
          },
        },
      };
    }
    return config;
  },
};

// For production builds, enable more optimizations
if (process.env.NODE_ENV === 'production') {
  // Add production-specific configurations here
  nextConfig.compress = true;
  nextConfig.optimizeFonts = true;
  nextConfig.swcMinify = true;
}

module.exports = nextConfig;
