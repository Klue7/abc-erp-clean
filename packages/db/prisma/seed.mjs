import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.customerTier.createMany({
    data: [
      { code: 'RETAIL', name: 'Retail', discountPercent: 0, description: 'Default walk-in pricing' },
      { code: 'CTR', name: 'Contractor', discountPercent: 7.5, description: 'Preferred contractor discount' },
      { code: 'PARTNER', name: 'Partner', discountPercent: 12.5, description: 'Strategic partner pricing' },
    ],
    skipDuplicates: true,
  })

  await prisma.product.createMany({
    data: [
      { sku: 'BRK-STN-001', name: 'Standard Clay Brick', basePrice: 1.15, unit: 'each' },
      { sku: 'CEM-42', name: '42.5N Cement 50kg', basePrice: 6.8, unit: 'bag' },
      { sku: 'SAN-PLT', name: 'River Sand', basePrice: 32.0, unit: 'm3' },
    ],
    skipDuplicates: true,
  })

  const tiers = await prisma.customerTier.findMany();
  const products = await prisma.product.findMany();
  const retail = tiers.find(t => t.code === 'RETAIL');
  const contractor = tiers.find(t => t.code === 'CTR');
  const partner = tiers.find(t => t.code === 'PARTNER');

  const standardBrick = products.find(p => p.sku === 'BRK-STN-001');
  const cement = products.find(p => p.sku === 'CEM-42');
  const sand = products.find(p => p.sku === 'SAN-PLT');

  const pairs = [
    [standardBrick, retail, standardBrick?.basePrice ?? 0],
    [standardBrick, contractor, (standardBrick?.basePrice ?? 0) * 0.93],
    [standardBrick, partner, (standardBrick?.basePrice ?? 0) * 0.9],
    [cement, retail, cement?.basePrice ?? 0],
    [cement, contractor, (cement?.basePrice ?? 0) * 0.94],
    [sand, retail, sand?.basePrice ?? 0],
    [sand, contractor, (sand?.basePrice ?? 0) * 0.9],
  ];

  for (const [product, tier, price] of pairs) {
    if (!product || !tier) continue;
    await prisma.productPrice.upsert({
      where: { productId_tierId: { productId: product.id, tierId: tier.id } },
      create: { productId: product.id, tierId: tier.id, price },
      update: { price },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect().finally(() => process.exit(1)) })
