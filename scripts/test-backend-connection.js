// scripts/test-backend-connection.js
const https = require('https');

function testBackendConnection() {
  console.log('Testing connection to backend...');
  
  const options = {
    hostname: 'coworking-platform-backend.onrender.com',
    port: 443,
    path: '/api/health',
    method: 'GET',
    timeout: 5000, // 5 second timeout
  };

  const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Response Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        console.log('Response Body:', JSON.parse(data));
      } catch (e) {
        console.log('Response Body:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req.on('timeout', () => {
    console.error('Request timed out');
    req.destroy();
  });

  req.end();
}

testBackendConnection();
