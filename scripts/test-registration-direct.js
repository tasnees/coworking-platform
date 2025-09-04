// scripts/test-registration-direct.js
const axios = require('axios');

async function testRegistration() {
  const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!',
    role: 'member'
  };

  try {
    console.log('Testing registration with user:', { ...testUser, password: '***' });
    
    // Test direct backend registration
    console.log('\nTesting direct backend registration...');
    const backendResponse = await axios.post(
      'https://coworking-platform-backend.onrender.com/api/auth/register',
      testUser
    );
    console.log('Backend response:', backendResponse.data);
    
    // Test frontend API registration
    console.log('\nTesting frontend API registration...');
    const frontendResponse = await axios.post(
      'https://coworking-platform.onrender.com/api/auth/signup',
      testUser
    );
    console.log('Frontend API response:', frontendResponse.data);
    
  } catch (error) {
    console.error('Test failed:');
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();
