/*
  Warnings:

  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerTier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Inventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SupplierItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vehicle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Customer" DROP CONSTRAINT "Customer_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Customer" DROP CONSTRAINT "Customer_tierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CustomerAddress" DROP CONSTRAINT "CustomerAddress_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Inventory" DROP CONSTRAINT "Inventory_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SupplierItem" DROP CONSTRAINT "SupplierItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SupplierItem" DROP CONSTRAINT "SupplierItem_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserRole" DROP CONSTRAINT "UserRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserRole" DROP CONSTRAINT "UserRole_userId_fkey";

-- DropTable
DROP TABLE "public"."Company";

-- DropTable
DROP TABLE "public"."Customer";

-- DropTable
DROP TABLE "public"."CustomerAddress";

-- DropTable
DROP TABLE "public"."CustomerTier";

-- DropTable
DROP TABLE "public"."Inventory";

-- DropTable
DROP TABLE "public"."Product";

-- DropTable
DROP TABLE "public"."Role";

-- DropTable
DROP TABLE "public"."Supplier";

-- DropTable
DROP TABLE "public"."SupplierItem";

-- DropTable
DROP TABLE "public"."User";

-- DropTable
DROP TABLE "public"."UserRole";

-- DropTable
DROP TABLE "public"."Vehicle";

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'basic',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "public"."users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "public"."customers"("email");
