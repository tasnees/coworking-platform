/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for production
  output: 'standalone',
  
  // Configure images if needed
  images: {
    domains: ['localhost'], // Add your image domains here
  },
  
  // Webpack configuration (if needed)
  webpack: (config, { isServer }) => {
    // Add custom webpack configuration here if needed
    return config;
  },
  
  // Handle 404 page
  async redirects() {
    return [
      {
        source: '/_error',
        destination: '/404',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
