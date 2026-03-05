
import { prisma } from './server/prisma.js';

async function createModerator2() {
  try {
    console.log('Creating moderador2...');
    const user = await prisma.user.upsert({
      where: { email: 'moderador2@example.com' },
      update: { 
        role: 'MODERATOR', 
        password: 'moderador2',
        companyTag: 'moderation' 
      },
      create: {
        name: 'moderador2',
        email: 'moderador2@example.com',
        password: 'moderador2',
        role: 'MODERATOR',
        companyTag: 'moderation'
      }
    });
    console.log('Created/Updated moderador2:', user);
  } catch (e) {
    console.error('Error creating moderador2:', e);
  } finally {
    await prisma.$disconnect();
  }
}

createModerator2();
