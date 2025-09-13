/*
  Warnings:

  - You are about to drop the column `bankAcc` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,roleId]` on the table `user_roles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_companyId_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_userId_fkey";

-- DropIndex
DROP INDEX "user_roles_userId_roleId_companyId_key";

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "bankAcc",
DROP COLUMN "bankName",
DROP COLUMN "logoUrl",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "vatNumber" TEXT;

-- AlterTable
ALTER TABLE "user_roles" DROP COLUMN "companyId";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "line1" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT,
    "gpsLat" DECIMAL(10,6),
    "gpsLng" DECIMAL(10,6),

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "supplierCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "addressLine1" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT,
    "leadTimeDays" INTEGER,
    "minOrderValue" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "subcategory" TEXT,
    "unit" TEXT,
    "imageUrl" TEXT,
    "unitsPerPallet" INTEGER,
    "weightKgPerUnit" DECIMAL(10,3),
    "lengthMm" INTEGER,
    "widthMm" INTEGER,
    "heightMm" INTEGER,
    "coverageM2PerUnit" DECIMAL(10,3),
    "coverageNotes" TEXT,
    "baseCostExVat" DECIMAL(10,2),
    "vatRatePct" DECIMAL(5,2),
    "marginRetailPct" DECIMAL(5,2),
    "marginConstructionPct" DECIMAL(5,2),
    "marginProjectPct" DECIMAL(5,2),
    "moqUnits" INTEGER,
    "reorderPointUnits" INTEGER,
    "leadTimeDays" INTEGER,
    "stackLimitUnits" INTEGER,
    "hazardousFlag" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_items" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "supplierItemCode" TEXT,

    CONSTRAINT "supplier_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locationBin" TEXT NOT NULL,
    "qtyOnHand" INTEGER NOT NULL DEFAULT 0,
    "qtyReserved" INTEGER NOT NULL DEFAULT 0,
    "qtyOnOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "vehicleCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "regNumber" TEXT,
    "maxPayloadKg" INTEGER,
    "bedVolumeM3" DECIMAL(10,2),
    "axleLimitKg" INTEGER,
    "fuelLPer100km" DECIMAL(10,2),
    "driverHourlyRate" DECIMAL(10,2),
    "costPerKmBase" DECIMAL(10,2),
    "serviceIntervalKm" INTEGER,
    "tyreSize" TEXT,
    "tyreCostEach" DECIMAL(10,2),
    "tyreCount" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplierCode_key" ON "suppliers"("supplierCode");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_items_supplierId_productId_key" ON "supplier_items"("supplierId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_productId_locationBin_key" ON "inventory"("productId", "locationBin");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicleCode_key" ON "vehicles"("vehicleCode");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_items" ADD CONSTRAINT "supplier_items_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_items" ADD CONSTRAINT "supplier_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
