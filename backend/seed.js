const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

mongoose.connect('mongodb://localhost:27017/coworking-platform')
  .then(async () => {
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      membershipStatus: 'active',
      approvalStatus: 'approved',
      joinDate: new Date()
    });
    
    await admin.save();
    console.log('Admin user created: admin@test.com / password123');
    process.exit(0);
  })
  .catch(err => console.error(err));
