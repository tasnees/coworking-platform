const axios = require('axios');
const https = require('https');
const cookie = require('cookie');
require('dotenv').config({ path: '.env.local' });

const API_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Create axios instance that handles cookies
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false // Only for testing, remove in production
  })
});

// Store cookies between requests
let cookies = {};

// Helper to update cookies from response headers
function updateCookies(headers) {
  const setCookieHeaders = headers['set-cookie'] || [];
  
  setCookieHeaders.forEach(cookieStr => {
    const parsed = cookie.parse(cookieStr);
    cookies = { ...cookies, ...parsed };
  });
  
  // Set the Cookie header for subsequent requests
  const cookieString = Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
    
  axiosInstance.defaults.headers.Cookie = cookieString;
  
  console.log('Updated cookies:', Object.keys(cookies).join(', '));
}

async function testAuthFlow(email, password) {
  try {
    console.log(`\n=== Testing Authentication Flow for ${email} ===`);
    
    // 1. Get CSRF token
    console.log('\n1. Getting CSRF token...');
    const csrfResponse = await axiosInstance.get('/api/auth/csrf');
    updateCookies(csrfResponse.headers);
    
    const csrfToken = csrfResponse.data.csrfToken;
    console.log('CSRF Token:', csrfToken);

    // 2. Attempt to sign in
    console.log('\n2. Attempting to sign in...');
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('csrfToken', csrfToken);
    formData.append('json', 'true');
    formData.append('redirect', 'false');
    formData.append('callbackUrl', `${API_URL}/dashboard`);
    
    const signInResponse = await axiosInstance.post(
      '/api/auth/callback/credentials',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      }
    );
    
    updateCookies(signInResponse.headers);
    
    console.log('Sign-in response:', {
      status: signInResponse.status,
      data: signInResponse.data,
      headers: signInResponse.headers
    });

    // 3. Get session
    console.log('\n3. Getting session...');
    const sessionResponse = await axiosInstance.get('/api/auth/session', {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('Session data:', {
      status: sessionResponse.status,
      data: sessionResponse.data
    });

    if (sessionResponse.data?.user) {
      console.log('\n✅ Authentication successful!');
      console.log('User:', sessionResponse.data.user);
      
      // 4. Test protected route
      console.log('\n4. Testing protected route...');
      try {
        const protectedResponse = await axiosInstance.get('/api/protected-route');
        console.log('Protected route response:', {
          status: protectedResponse.status,
          data: protectedResponse.data
        });
      } catch (error) {
        console.error('Protected route error:', {
          status: error.response?.status,
          data: error.response?.data
        });
      }
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

// Install required package if not already installed
console.log('Installing required packages...');
require('child_process').execSync('npm install cookie --save', { stdio: 'inherit' });

// Test with admin credentials
testAuthFlow('graba.hedi@gmail.com', 'hedi2004');

// Uncomment to test with staff credentials
// testAuthFlow('aminegraba54@gmail.com', 'staff_password_here');
