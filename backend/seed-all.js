const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

mongoose.connect('mongodb://localhost:27017/coworking-platform')
  .then(async () => {
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
        membershipStatus: 'active',
        approvalStatus: 'approved',
        joinDate: new Date()
      },
      {
        firstName: 'Staff',
        lastName: 'Member',
        email: 'staff@test.com',
        password: hashedPassword,
        role: 'staff',
        membershipStatus: 'active',
        approvalStatus: 'approved',
        joinDate: new Date()
      },
      {
        firstName: 'Regular',
        lastName: 'Member',
        email: 'member@test.com',
        password: hashedPassword,
        role: 'member',
        membershipStatus: 'active',
        approvalStatus: 'approved',
        joinDate: new Date()
      }
    ];
    
    await User.insertMany(users);
    console.log('Test users created:');
    console.log('Admin: admin@test.com / password123');
    console.log('Staff: staff@test.com / password123');
    console.log('Member: member@test.com / password123');
    process.exit(0);
  })
  .catch(err => console.error(err));
