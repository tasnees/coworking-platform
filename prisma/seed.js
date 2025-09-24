const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample resources
  const resources = [
    {
      id: "507f1f77bcf86cd799439011",
      name: "Desk A-12",
      type: "Hot Desk",
      capacity: 1,
      hourlyRate: 15,
      status: "available",
      location: "Main Floor",
      description: "A comfortable hot desk with great lighting"
    },
    {
      id: "507f1f77bcf86cd799439012",
      name: "Meeting Room B",
      type: "Meeting Room",
      capacity: 8,
      hourlyRate: 50,
      status: "available",
      location: "Second Floor",
      description: "Perfect for team meetings and presentations"
    },
    {
      id: "507f1f77bcf86cd799439013",
      name: "Private Office 3",
      type: "Private Office",
      capacity: 4,
      hourlyRate: 80,
      status: "available",
      location: "Third Floor",
      description: "Private office space for focused work"
    },
    {
      id: "507f1f77bcf86cd799439014",
      name: "Phone Booth 1",
      type: "Phone Booth",
      capacity: 1,
      hourlyRate: 10,
      status: "available",
      location: "Main Floor",
      description: "Private space for phone calls and video meetings"
    }
  ];

  console.log('📦 Creating resources...');
  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { id: resource.id },
      update: {
        name: resource.name,
        type: resource.type,
        capacity: resource.capacity,
        hourlyRate: resource.hourlyRate,
        status: resource.status,
        location: resource.location,
        description: resource.description
      },
      create: resource
    });
  }

  console.log('✅ Resources created successfully');

  // Create sample users if they don't exist
  const users = [
    {
      email: 'member@example.com',
      name: 'John Doe',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'member',
      status: 'active'
    },
    {
      email: 'admin@example.com',
      name: 'Admin User',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'admin',
      status: 'active'
    },
    {
      email: 'staff@example.com',
      name: 'Staff User',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'staff',
      status: 'active'
    }
  ];

  console.log('👥 Creating users...');
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user
    });
  }

  console.log('✅ Users created successfully');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
