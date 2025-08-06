/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable App Router
  experimental: {
    appDir: true,
  },
  typescript: {
    // Enable type checking during build process
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Webpack configuration
  webpack: (config, { isServer }) => {
    return config;
  },
  // Image optimization
  images: {
    domains: ['localhost'],
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Disable static pages generation for App Router
  output: 'standalone',
  // Enable server components external packages
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
};

module.exports = nextConfig;
