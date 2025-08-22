const fs = require('fs');
const path = require('path');

const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
const serverFile = path.join(standaloneDir, 'server.js');

// Create standalone directory if it doesn't exist
if (!fs.existsSync(standaloneDir)) {
  fs.mkdirSync(standaloneDir, { recursive: true });
}

// Create a minimal server.js file
const serverContent = `// Standalone server for production
const express = require('express');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: path.join(__dirname, '..') });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();

  // Serve static files
  server.use(
    '/_next/static',
    express.static(path.join(__dirname, '.next/static'), {
      maxAge: '1y',
      immutable: true,
    })
  );

  // Handle Next.js requests
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(\`🚀 Server ready on http://localhost:\${port}\`);
  });
});
`;

// Write the server file
fs.writeFileSync(serverFile, serverContent);
console.log('✅ Created standalone server.js file');
