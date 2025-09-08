#!/bin/bash
set -e # Exit on error

echo "🚀 Starting build process..."

# Create necessary directories
echo "📂 Creating required directories..."
mkdir -p .next/standalone

# Install dependencies with cache
echo "📦 Installing dependencies..."
npm ci --prefer-offline --no-audit --progress=false

# Install Prisma and generate client
echo "⚙️ Setting up Prisma..."
npx prisma generate

# Build the application
echo "🔨 Building application..."
npm run build

# Create standalone directory structure
echo "📄 Setting up standalone output..."

# Copy the standalone output
if [ -d ".next/standalone" ]; then
  # Copy the standalone server
  cp -r .next/standalone/. .next/standalone-temp
  
  # Copy required directories
  mkdir -p .next/standalone-temp/.next
  cp -r .next/static .next/standalone-temp/.next/
  cp -r .next/server .next/standalone-temp/.next/
  
  # Copy public files
  cp -r public .next/standalone-temp/
  
  # Copy required configuration files
  cp next.config.js .next/standalone-temp/
  
  # Replace the standalone directory
  rm -rf .next/standalone
  mv .next/standalone-temp .next/standalone
  
  # Ensure the server file is executable
  chmod +x .next/standalone/server.js
  
  echo "✅ Standalone build completed successfully!"
else
  echo "❌ Error: Standalone output not found. Build may have failed."
  exit 1
fi
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
