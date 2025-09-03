/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    }
  },
  // External packages for server components
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all external images
      },
    ],
    // Enable optimized images in production
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // External packages
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Enable React strict mode
  reactStrictMode: true,
  
  // Output configuration
  output: 'standalone',
  
  // Disable powered by header for security
  poweredByHeader: false,
  
  // Enable compression
  compress: true,
  
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
