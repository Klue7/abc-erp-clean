// apps/web/prisma/seed.mjs
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.role.createMany({
    data: [
      { name: 'Administrator', slug: 'admin' },
      { name: 'Manager',       slug: 'manager' },
      { name: 'Staff',         slug: 'staff' },
    ],
    skipDuplicates: true,
  })

  await prisma.company.upsert({
    where: { id: 'seed-company' },
    update: {},
    create: { id: 'seed-company', name: 'African Brick Centre PE' },
  })

  await prisma.customerTier.createMany({
    data: [
      { code: 'STD', name: 'Standard', discount: 0 },
      { code: 'VIP', name: 'VIP',      discount: 7.5 },
    ],
    skipDuplicates: true,
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect().finally(() => process.exit(1)) })
