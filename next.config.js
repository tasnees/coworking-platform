/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image configuration
  images: {
    domains: ['localhost'],
    // No need for unoptimized: true since we're not doing static exports
  },
  
  // Webpack configuration
  webpack: (config) => {
    // Add custom webpack configuration here if needed
    return config;
  },
  
  // Disable server components external packages (if needed)
  transpilePackages: [],
  
  // Enable server actions and other experimental features
  experimental: {
    serverActions: true,
  },
  
  // Skip type checking during build (can help with build speed)
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Skip ESLint during build (can help with build speed)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
