
import { prisma } from './server/prisma.js';

async function checkUser() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        name: 'moderador'
      }
    });
    console.log('Moderator user:', user);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
