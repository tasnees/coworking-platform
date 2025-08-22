/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable App Router
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Remove static export for API routes to work
  // output: 'export', // Commented out to enable API routes
  
  // Image optimization configuration
  images: {
    domains: [
      'localhost',
      'coworking-platform-smoky.vercel.app',
      'coworking-platform.onrender.com',
    ],
    // Disable image optimization during export if needed
    unoptimized: process.env.NODE_ENV === 'production',
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
  
  // Enable trailing slashes for better routing
  trailingSlash: false,
  
  // Enable React strict mode
  reactStrictMode: true,
  
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
