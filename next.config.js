/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable App Router
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Server external packages
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image optimization
  images: {
    unoptimized: process.env.NODE_ENV !== 'production',
    domains: [
      'localhost',
      'coworking-platform.onrender.com',
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Enable trailing slashes for better routing
  trailingSlash: false,
  
  // Server-side rendering configuration
  // Removed 'output: export' to enable server-side features like API routes
  
  // Enable React strict mode
  reactStrictMode: true,

  // Security headers are handled at the hosting/CDN level for static exports
  // See: https://nextjs.org/docs/messages/export-no-custom-routes

  // Output configuration - only enable standalone if needed for deployment
  // output: 'standalone',
  
  // Enable production source maps
  productionBrowserSourceMaps: false, // Set to true for debugging in production
  
  // React and build configurations
  reactStrictMode: true,
  
  // Minification is now handled automatically in production
  // Remove swcMinify as it's now the default
  
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
  // SWC minification is now enabled by default in Next.js
}

module.exports = nextConfig;
