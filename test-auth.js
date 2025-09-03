const axios = require('axios');
const https = require('https');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'https://coworking-platform.onrender.com';

// Create axios instance that saves cookies
const axiosInstance = axios.create({
  withCredentials: true,
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false // Only for testing, remove in production
  })
});

// Helper function to test direct backend login
async function testBackendLogin(email, password) {
  try {
    console.log('\n1. Testing direct backend login...');
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      { email, password },
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        validateStatus: (status) => status < 500
      }
    );
    
    console.log('Backend login response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    
    // 2. Test the proxy endpoint
    console.log('\n2. Testing proxy endpoint...');
    const proxyResponse = await axios.post(
      `${API_URL}/api/proxy/auth/login`,
      { email, password },
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        validateStatus: (status) => status < 500
      }
    );
    
    console.log('Proxy response:', {
      status: proxyResponse.status,
      data: proxyResponse.data,
      headers: proxyResponse.headers
    });
    
    return response.data;
  } catch (error) {
    console.error('Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    return null;
  }
}

async function testLogin(email, password, role) {
  try {
    console.log(`\n=== Testing login for ${role} (${email}) ===`);
    
    // 1. Get CSRF token first
    console.log('\n1. Getting CSRF token...');
    const csrfResponse = await axiosInstance.get(`${API_URL}/api/auth/csrf`);
    console.log('CSRF Token:', csrfResponse.data.csrfToken);
    
    // 2. Attempt to login
    console.log('\n2. Attempting login...');
    const loginData = new URLSearchParams();
    loginData.append('email', email);
    loginData.append('password', password);
    loginData.append('redirect', 'false');
    loginData.append('callbackUrl', `${API_URL}/dashboard/${role}`);
    loginData.append('json', 'true');
    loginData.append('csrfToken', csrfResponse.data.csrfToken);

    const loginResponse = await axiosInstance.post(
      `${API_URL}/api/auth/callback/credentials`,
      loginData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      }
    );

    console.log('Login response status:', loginResponse.status);
    console.log('Login response data:', JSON.stringify(loginResponse.data, null, 2));
    
    // 3. Get session
    console.log('\n3. Getting session...');
    const sessionResponse = await axiosInstance.get(`${API_URL}/api/auth/session`);
    console.log('Session data:', JSON.stringify(sessionResponse.data, null, 2));
    
    // 4. Verify user role in session
    if (sessionResponse.data.user?.role === role) {
      console.log(`✅ Successfully logged in as ${role}`);
      console.log(`   User ID: ${sessionResponse.data.user.id}`);
      console.log(`   Email: ${sessionResponse.data.user.email}`);
      console.log(`   Name: ${sessionResponse.data.user.name}`);
    } else {
      console.log(`❌ Unexpected role in session. Expected: ${role}, Got: ${sessionResponse.data.user?.role || 'none'}`);
    }
    
    return sessionResponse.data;
  } catch (error) {
    console.error(`❌ Error logging in as ${role}:`, error.response?.data || error.message);
    return null;
  }
}

// Test with admin and staff credentials
async function runTests() {
  // Test direct backend login first
  console.log('\n=== Testing Direct Backend Login ===');
  const adminBackendResult = await testBackendLogin(
    'graba.hedi@gmail.com',
    'hedi2004'
  );

  // Only proceed with NextAuth tests if backend login works
  if (adminBackendResult?.success) {
    console.log('\nBackend login successful, testing NextAuth...');
    
    // Test admin login
    console.log('\n=== Testing Admin Login ===');
    await testLogin(
      'graba.hedi@gmail.com', // Admin email
      'hedi2004',            // Admin password
      'admin'                // Expected role
    );
    
    // Test staff login
    console.log('\n=== Testing Staff Login ===');
    await testLogin(
      'aminegraba54@gmail.com', // Staff email
      'hedi2004',              // Staff password
      'staff'                  // Expected role
    );
  } else {
    console.log('\n❌ Backend login failed. Please check your backend service and credentials.');
  }
}

runTests();
