
import { prisma } from './server/prisma.js';

async function checkModerator() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'moderador@example.com' },
          { name: 'moderador' }
        ]
      }
    });
    console.log('Moderator user found:', user);
    
    if (user) {
      console.log('Password match check:', user.password === 'moderador');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkModerator();
