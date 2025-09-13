import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listModels() {
  try {
    // Get all properties from the Prisma client
    const models = Object.keys(prisma);
    console.log('Available models in Prisma client:');
    models.forEach(model => console.log(`- ${model}`));
  } catch (error) {
    console.error('Error listing models:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listModels();
