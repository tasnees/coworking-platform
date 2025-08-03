/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image configuration
  images: {
    domains: ['localhost', 'c2634db15524.ngrok-free.app'],
  },
  
  // Webpack configuration
  webpack: (config) => {
    // Add custom webpack configuration here if needed
    return config;
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
