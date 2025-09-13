import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkModelName() {
  try {
    // This will show the available models and their properties
    console.log('Prisma client keys:');
    console.log(Object.keys(prisma));
    
    // Check if membershipPlan exists
    console.log('\nChecking membershipPlan model:');
    console.log('membershipPlan in prisma:', 'membershipPlan' in prisma);
    
    if ('membershipPlan' in prisma) {
      console.log('membershipPlan properties:', Object.keys(prisma.membershipPlan));
    }
    
  } catch (error) {
    console.error('Error checking model name:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkModelName();
