/** @type {import('next').NextConfig} */

module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  webpack: (config, { isServer }) => {
    // Handle CSS files
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader',
      ],
    });

    // Transpile specific modules if needed
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
  // Enable experimental features for better compatibility
  transpilePackages: ['mongodb', 'bson'],
};
