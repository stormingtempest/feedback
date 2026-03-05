
import { prisma } from './server/prisma.js';

async function fixModerator2() {
  try {
    console.log('Updating moderador2...');
    const user = await prisma.user.update({
      where: { email: 'moderador2@example.com' },
      data: { 
        role: 'MODERATOR', 
        companyTag: 'moderation' 
      }
    });
    console.log('Updated moderador2:', user);
  } catch (e) {
    console.error('Error updating moderador2:', e);
  } finally {
    await prisma.$disconnect();
  }
}

fixModerator2();
