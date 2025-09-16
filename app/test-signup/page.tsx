"use client";

import { useState } from 'react';

export default function TestSignup() {
  const [logs, setLogs] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: 'Test User',
    email: `test-${Math.random().toString(36).substring(2, 10)}@example.com`,
    password: 'Test123!',
    role: 'member'
  });

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toISOString()}] ${message}`, ...prev]);
  };

  const testDirectBackend = async () => {
    try {
      addLog('Testing direct backend connection...');
      const response = await fetch('https://coworking-platform-backend.onrender.com/api/health');
      const data = await response.json();
      addLog(`Backend health check: ${response.status} - ${JSON.stringify(data)}`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`Backend health check failed: ${errorMessage}`);
      return false;
    }
  };

  const testSignup = async (endpoint: string) => {
    try {
      addLog(`\nTesting signup with endpoint: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json().catch(() => ({}));
      
      addLog(`Response status: ${response.status}`);
      addLog(`Response data: ${JSON.stringify(data)}`);
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`Error: ${errorMessage}`);
      
     
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } };
        if (axiosError.response?.data) {
          addLog(`Response error: ${JSON.stringify(axiosError.response.data)}`);
        }
      }
      return false;
    }
  };

  const runTests = async () => {
    setLogs([]);
    
   
    const backendAvailable = await testDirectBackend();
    
    if (!backendAvailable) {
      addLog('Backend is not available. Please check if the backend service is running.');
      return;
    }
    
   
    const endpoints = [
      'https://coworking-platform-backend.onrender.com/api/auth/register',
      '/api/auth/signup',
      '/api/proxy/auth/register'
    ];
    
    for (const endpoint of endpoints) {
      await testSignup(endpoint);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Signup Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Data</h2>
        <div className="grid gap-4 mb-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <label className="w-24 font-medium">{key}:</label>
              <input
                type={key === 'password' ? 'password' : 'text'}
                value={value}
                onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                className="flex-1 p-2 border rounded"
              />
            </div>
          ))}
        </div>
        
        <button
          onClick={runTests}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Run Tests
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        <div className="font-mono text-sm bg-black text-green-400 p-4 rounded overflow-auto h-96">
          {logs.length === 0 ? (
            <div className="text-gray-500">Click 'Run Tests' to start testing</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="mb-1 border-b border-gray-800 pb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
