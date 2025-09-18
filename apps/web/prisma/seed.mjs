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

  // sample products
  await prisma.product.createMany({
    data: [
      { sku: 'BRK-STD-01', name: 'Standard Brick', basePrice: 1.0 },
      { sku: 'BRK-VIP-01', name: 'Premium Brick', basePrice: 1.5 },
    ],
    skipDuplicates: true,
  })

  // attach tier-specific prices (if any)
  const tiers = await prisma.customerTier.findMany();
  const products = await prisma.product.findMany();
  const std = tiers.find(t => t.code === 'STD');
  const vip = tiers.find(t => t.code === 'VIP');
  const p1 = products.find(p => p.sku === 'BRK-STD-01');
  const p2 = products.find(p => p.sku === 'BRK-VIP-01');

  if (std && p1) {
    await prisma.productPrice.upsert({
      where: { productId_tierId: { productId: p1.id, tierId: std.id } },
      create: { productId: p1.id, tierId: std.id, price: p1.basePrice },
      update: {},
    })
  }
  if (vip && p2) {
    await prisma.productPrice.upsert({
      where: { productId_tierId: { productId: p2.id, tierId: vip.id } },
      create: { productId: p2.id, tierId: vip.id, price: p2.basePrice * 0.9 },
      update: {},
    })
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect().finally(() => process.exit(1)) })
