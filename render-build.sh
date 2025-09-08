#!/bin/bash
set -e # Exit on error

echo "🚀 Starting build process..."

# Create necessary directories
echo "📂 Creating required directories..."
mkdir -p .next/standalone/.next

# Install dependencies with cache
echo "📦 Installing dependencies..."
npm ci --prefer-offline --no-audit --progress=false

# Install Prisma and generate client
echo "⚙️ Setting up Prisma..."
npx prisma generate

# Verify database connection
echo "🔌 Testing database connection..."
npx prisma db push --skip-generate

# Build the application in standalone mode
echo "🔨 Building application in standalone mode..."
npm run build

# Create standalone directory structure
echo "📄 Setting up standalone output..."
mkdir -p .next/standalone/.next

# Copy required files for standalone mode
cp -r .next/standalone/.next .next/standalone/
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
cp next.config.js .next/standalone/
cp -r .next/server .next/standalone/.next/
cp -r .next/trace .next/standalone/.next/
cp -r .next/cache .next/standalone/.next/

# Ensure the server file is executable
chmod +x .next/standalone/server.js
cp -r .next/server .next/standalone/.next/
cp -r .next/chunks .next/standalone/.next/
cp -r .next/cache .next/standalone/.next/

# Create server.js for standalone mode
cat > .next/standalone/server.js << 'EOL'
// Standalone server for production
const express = require('express');
const next = require('next');
const path = require('path');
const { parse } = require('url');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ 
  dev,
  dir: __dirname,
  customServer: false,
  conf: require('./next.config.js')
});
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();

  // Enable trust proxy for production
  server.enable('trust proxy');

  // Security headers
  server.use(require('helmet')());
  
  // Body parsing
  server.use(require('express').json({ limit: '10mb' }));
  server.use(require('express').urlencoded({ extended: true, limit: '10mb' }));

  // Serve static files
  server.use(
    '/_next/static',
    express.static(path.join(__dirname, '.next/static'), {
      maxAge: '1y',
      immutable: true,
    })
  );

  // Serve public files
  server.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1y',
    immutable: true
  }));

  // Handle Next.js requests
  server.get('*', (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Start the server
  server.listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on http://0.0.0.0:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`> Node version: ${process.version}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
EOL

echo "✅ Build completed successfully!"

# Make the script executable
chmod +x .next/standalone/server.js

# List the contents of the standalone directory for debugging
echo "📂 Contents of .next/standalone/:"
ls -la .next/standalone/ || true
