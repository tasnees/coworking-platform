/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Enable server components
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
      allowedOrigins: ['*'],
    },
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  
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
  // Enable standalone output for production
  nextConfig.output = 'standalone';
  
  // Add production-specific configurations here
  nextConfig.compress = true;
  nextConfig.swcMinify = true;
  
  // Enable production optimizations
  nextConfig.productionBrowserSourceMaps = false;
  
  // Configure output file tracing
  nextConfig.experimental = {
    ...nextConfig.experimental,
    outputFileTracingRoot: path.join(__dirname, '../../'),
    outputFileTracingExcludes: {
      '*': [
        'node_modules/**/@swc/core-linux-x64-gnu',
        'node_modules/**/@swc/core-linux-x64-musl',
        'node_modules/**/@esbuild/linux-x64',
      ],
    },
  };
}

module.exports = nextConfig;
