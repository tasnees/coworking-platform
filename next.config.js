/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Enable type checking during build process
    // Set this to false if you want to skip type checking during build
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Ensure the build includes necessary files
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
  // Add any custom domains for images
  images: {
    domains: ['localhost'],
  },
  // Enable React Strict Mode
  reactStrictMode: true,
};

module.exports = nextConfig;
