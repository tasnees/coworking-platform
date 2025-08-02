/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image configuration
  images: {
    domains: ['localhost'],
  },
  
  // Webpack configuration
  webpack: (config) => {
    // Add custom webpack configuration here if needed
    return config;
  },
  
  // Enable server actions
  experimental: {
    serverActions: true,
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
