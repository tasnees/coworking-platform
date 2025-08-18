const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const TEST_EMAIL = `testuser_${Date.now()}@example.com`;
const TEST_PASSWORD = 'testpassword123';
const TEST_NAME = 'Test User';

async function testRegistration() {
  console.log('🚀 Starting registration test...');
  
  try {
    // Test registration
    console.log('\n1. Testing user registration...');
    const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        role: 'member'
      }),
    });

    const registerData = await registerResponse.json();
    console.log('Registration Response:', {
      status: registerResponse.status,
      statusText: registerResponse.statusText,
      data: registerData
    });

    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerData.error || 'Unknown error'}`);
    }

    console.log('✅ Registration successful!');
    console.log('User ID:', registerData.userId);
    
    // Test login
    console.log('\n2. Testing login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        redirect: false,
        json: true
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', {
      status: loginResponse.status,
      statusText: loginResponse.statusText,
      data: loginData
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData.error || 'Unknown error'}`);
    }

    console.log('✅ Login successful!');
    console.log('Session:', loginData);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testRegistration();
