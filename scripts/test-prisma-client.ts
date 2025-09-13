import { PrismaClient } from '@prisma/client';

async function testPrismaClient() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Testing Prisma client...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // Try to find a membership plan
    console.log('\nFetching membership plans...');
    const plans = await prisma.membershipPlan.findMany();
    console.log('✅ Found', plans.length, 'membership plans');
    
    if (plans.length > 0) {
      console.log('\nFirst membership plan:', {
        id: plans[0].id,
        name: plans[0].name,
        type: plans[0].type,
        price: plans[0].price,
        features: plans[0].features,
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing Prisma client:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nDisconnected from the database');
  }
}

testPrismaClient();
