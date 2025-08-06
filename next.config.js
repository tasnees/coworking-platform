/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable App Router
  experimental: {
    appDir: true,
    serverActions: true,
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
    // Important: return the modified config
    return config;
  },
  // Image optimization
  images: {
    domains: ['localhost'],
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Output configuration
  output: 'standalone',
  // Enable server components external packages
  serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  // Disable static pages generation for App Router
  generateEtags: false,
  // Disable static optimization for the entire app
  trailingSlash: false,
  // Disable powered by header
  poweredByHeader: false,
  // Enable production browser source maps
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
