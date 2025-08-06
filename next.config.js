/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable App Router
  experimental: {
    appDir: true,
    serverActions: true,
    // Enable server components external packages
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  typescript: {
    // Enable type checking during build process
    ignoreBuildErrors: false,
  },
  eslint: {
    // Allow production builds to complete with ESLint warnings
    ignoreDuringBuilds: true,
  },
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
  // Image optimization
  images: {
    domains: [
      'localhost',
      'coworking-platform.onrender.com',
      // Add other domains as needed
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Output configuration
  output: 'standalone',
  // Disable static pages generation for App Router
  generateEtags: true, // Enable etags for better caching
  // Disable static optimization for the entire app
  trailingSlash: false,
  // Security headers
  headers: async () => {
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
  // Disable powered by header
  poweredByHeader: false,
  // Enable production browser source maps (optional, disable for smaller build size)
  productionBrowserSourceMaps: false,
  // Configure page revalidation (ISR)
  experimental: {
    isrMemoryCacheSize: 0, // Disable in-memory cache in favor of file-system cache
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
