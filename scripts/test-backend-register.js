// scripts/test-backend-register.js
const axios = require('axios');

async function testBackendRegister() {
  const BACKEND_URL = 'http://localhost:5000';
  
  const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!',
    role: 'member'
  };

  try {
    console.log('Testing backend registration endpoint...');
    console.log('Sending request to:', `${BACKEND_URL}/api/auth/register`);
    
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/register`,
      testUser,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: () => true // Don't throw on HTTP error status
      }
    );

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    if (response.data.success) {
      console.log('✅ Registration successful!');
      console.log('User token:', response.data.token);
    } else {
      console.error('❌ Registration failed:', response.data.message);
    }
  } catch (error) {
    console.error('Error during test:', error.message);
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
  }
}

testBackendRegister();
