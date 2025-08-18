// Script to monitor MongoDB connection lifecycle
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// Track active connections
const activeConnections = new Set();
let connectionCounter = 0;

// Override console.log to add timestamps
const originalLog = console.log;
console.log = (...args) => {
  const timestamp = new Date().toISOString();
  originalLog(`[${timestamp}]`, ...args);
};

// Track unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Track uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Track process signals
['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach(signal => {
  process.on(signal, () => {
    console.log(`\n${signal} received - cleaning up...`);
    console.log(`Active connections: ${activeConnections.size}`);
    process.exit(0);
  });
});

// Create a monitored MongoDB client
function createMonitoredClient() {
  const connId = ++connectionCounter;
  const client = new MongoClient(process.env.MONGODB_URI, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 5,
    minPoolSize: 1,
    maxIdleTimeMS: 60000,
    waitQueueTimeoutMS: 10000,
    monitorCommands: true,
  });

  // Track connection lifecycle
  console.log(`[Connection ${connId}] Creating new MongoDB client`);
  activeConnections.add(connId);
  console.log(`[Connection ${connId}] Active connections: ${activeConnections.size}`);

  // Monitor connection events
  client.on('connectionCreated', () => {
    console.log(`[Connection ${connId}] Connection created`);
  });

  client.on('connectionReady', () => {
    console.log(`[Connection ${connId}] Connection ready`);
  });

  client.on('connectionClosed', () => {
    console.log(`[Connection ${connId}] Connection closed`);
    activeConnections.delete(connId);
    console.log(`[Connection ${connId}] Active connections: ${activeConnections.size}`);
  });

  client.on('commandStarted', (event) => {
    if (event.commandName !== 'ping' && event.commandName !== 'isMaster') {
      console.log(`[Connection ${connId}] Command started: ${event.commandName}`, 
        JSON.stringify(event.command, null, 2));
    }
  });

  client.on('commandSucceeded', (event) => {
    if (event.commandName !== 'ping' && event.commandName !== 'isMaster') {
      console.log(`[Connection ${connId}] Command succeeded: ${event.commandName} (${event.duration}ms)`);
    }
  });

  client.on('commandFailed', (event) => {
    console.error(`[Connection ${connId}] Command failed: ${event.commandName}`, event.failure);
  });

  // Add cleanup on process exit
  const cleanup = async () => {
    if (activeConnections.has(connId)) {
      console.log(`[Connection ${connId}] Cleaning up...`);
      try {
        await client.close();
        console.log(`[Connection ${connId}] Cleaned up successfully`);
      } catch (error) {
        console.error(`[Connection ${connId}] Error during cleanup:`, error);
      }
      activeConnections.delete(connId);
    }
  };

  process.on('exit', cleanup);
  
  return {
    client,
    id: connId,
    close: async () => {
      await cleanup();
    }
  };
}

// Test function
async function testConnection() {
  const { client, id, close } = createMonitoredClient();
  
  try {
    console.log(`[Connection ${id}] Connecting to MongoDB...`);
    await client.connect();
    
    console.log(`[Connection ${id}] Listing databases...`);
    const dbs = await client.db().admin().listDatabases();
    console.log(`[Connection ${id}] Found ${dbs.databases.length} databases`);
    
    // Keep the connection open for a while to observe
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error(`[Connection ${id}] Error:`, error);
  } finally {
    await close();
  }
}

// Run multiple connection tests
async function runTests() {
  console.log('Starting connection tests...\n');
  
  // Run multiple connection tests in sequence
  for (let i = 0; i < 3; i++) {
    console.log(`\n=== Test ${i + 1} ===`);
    await testConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\nAll tests completed');
  console.log(`Final active connections: ${activeConnections.size}`);
  
  // Keep the process alive for a bit longer to observe any delayed events
  await new Promise(resolve => setTimeout(resolve, 2000));
  process.exit(0);
}

// Start the tests
runTests().catch(console.error);
