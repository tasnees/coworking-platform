const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const API_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

async function testAuthFlow(email, password) {
  try {
    console.log(`\n=== Testing Authentication Flow for ${email} ===`);
    
    // 1. Get CSRF token
    console.log('1. Getting CSRF token...');
    const csrfResponse = await axios.get(`${API_URL}/api/auth/csrf`);
    const csrfToken = csrfResponse.data.csrfToken;
    console.log('CSRF Token:', csrfToken);

    // 2. Attempt to sign in
    console.log('\n2. Attempting to sign in...');
    const signInResponse = await axios.post(
      `${API_URL}/api/auth/callback/credentials`,
      {
        email,
        password,
        csrfToken,
        json: 'true',
        redirect: 'false',
        callbackUrl: `${API_URL}/dashboard`
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      }
    );

    console.log('Sign-in response:', {
      status: signInResponse.status,
      data: signInResponse.data,
      headers: signInResponse.headers
    });

    // 3. Get session
    console.log('\n3. Getting session...');
    const sessionResponse = await axios.get(`${API_URL}/api/auth/session`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('Session data:', {
      status: sessionResponse.status,
      data: sessionResponse.data
    });

    if (sessionResponse.data?.user) {
      console.log('\n✅ Authentication successful!');
      console.log('User:', sessionResponse.data.user);
    } else {
      console.log('\n❌ Authentication failed - No user in session');
    }
  } catch (error) {
    console.error('\n❌ Error during authentication flow:', {
      message: error.message,
      response: {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      }
    });
  }
}

// Test with admin credentials
testAuthFlow('graba.hedi@gmail.com', 'hedi2004');

// Uncomment to test with staff credentials
// testAuthFlow('aminegraba54@gmail.com', 'staff_password_here');
