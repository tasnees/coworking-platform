const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Enable debug logging
mongoose.set('debug', true);

// Connect to MongoDB
async function connectDB() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');
    
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('MongoDB Connected to:', connection.connection.host);
    console.log('Database Name:', connection.connection.name);
    
    // List all collections
    const collections = await connection.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    if (err.name === 'MongooseServerSelectionError') {
      console.error('Failed to connect to MongoDB. Please check your connection string and ensure MongoDB is running.');
    }
    process.exit(1);
  }
}

// Check user role
async function checkUserRole(email) {
  try {
    const User = require('./backend/src/models/User');
    const user = await User.findOne({ email }).select('email role firstName lastName');
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:');
    console.log({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      isAdmin: user.role === 'admin'
    });
    
  } catch (error) {
    console.error('Error checking user role:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the check
(async () => {
  await connectDB();
  await checkUserRole('graba.hedi@gmail.com');
  await checkUserRole('aminegraba54@gmail.com');
})();
