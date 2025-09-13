import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if there are any existing membership plans
  const existingPlans = await prisma.membershipPlan.findMany();
  
  if (existingPlans.length === 0) {
    // Create some sample membership plans
    const samplePlans = [
      {
        name: 'Basic',
        type: 'monthly',
        price: 99,
        features: [
          'Access to hot desks',
          'Free coffee and tea',
          'High-speed WiFi',
          'Access during business hours'
        ],
        active: true,
        members: 0
      },
      {
        name: 'Professional',
        type: 'monthly',
        price: 199,
        features: [
          'Dedicated desk',
          '24/7 access',
          'Meeting room credits',
          'Free coffee, tea, and snacks',
          'High-speed WiFi',
          'Locker storage'
        ],
        active: true,
        members: 0
      },
      {
        name: 'Day Pass',
        type: 'daily',
        price: 25,
        features: [
          'Access to hot desks',
          'Free coffee and tea',
          'High-speed WiFi',
          'Access during business hours'
        ],
        active: true,
        members: 0
      }
    ];

    // Create the sample plans
    for (const plan of samplePlans) {
      await prisma.membershipPlan.create({
        data: plan
      });
    }

    console.log('Successfully created sample membership plans');
  } else {
    console.log('Membership plans already exist in the database');
  }
}

main()
  .catch((e) => {
    console.error('Error initializing membership plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
