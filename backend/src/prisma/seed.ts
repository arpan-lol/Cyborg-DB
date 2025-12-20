import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before importing Prisma client
dotenv.config({
  path: path.join(process.cwd(), '.env')
});

import prisma from './client';

async function main() {
  console.log('Seeding database...');

  const guestUser = await prisma.user.upsert({
    where: { email: 'guest@fluxai' },
    update: {},
    create: {
      email: 'guest@fluxai',
      name: 'Guest User',
      password: 'guest',
    },
  });

  console.log('Guest user created/updated:', guestUser);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
