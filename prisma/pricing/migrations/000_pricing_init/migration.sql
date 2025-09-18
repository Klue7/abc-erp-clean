-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "pricing";

-- CreateEnum
CREATE TYPE "pricing"."PriceTierCode" AS ENUM ('RETAIL', 'CONTRACTOR', 'TENDER', 'INHOUSE');

-- CreateEnum
CREATE TYPE "pricing"."UomCode" AS ENUM ('per_1000', 'per_ton', 'per_50kg_bag', 'per_8ton_load', 'per_26ton_load', 'each');

-- CreateTable
CREATE TABLE "pricing"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing"."CostVersion" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceWorkbook" TEXT,
    "sourceWorkbookHash" TEXT,
    "unitCost" DOUBLE PRECISION,
    "bagCost" DOUBLE PRECISION,
    "loadingFee" DOUBLE PRECISION,
    "transportPerUnit" DOUBLE PRECISION,
    "otherCost" DOUBLE PRECISION,
    "adminPerUnit" DOUBLE PRECISION,
    "storagePerUnit" DOUBLE PRECISION,
    "totalCostProvided" DOUBLE PRECISION,
    "landedExVat" DOUBLE PRECISION,
    "checksum" TEXT,

    CONSTRAINT "CostVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing"."PriceList" (
    "id" TEXT NOT NULL,
    "costVersionId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "markup" DOUBLE PRECISION NOT NULL,
    "priceExVat" DOUBLE PRECISION NOT NULL,
    "gpPct" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PriceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing"."PriceTier" (
    "id" TEXT NOT NULL,
    "code" "pricing"."PriceTierCode" NOT NULL,
    "name" TEXT NOT NULL,
    "defaultMarkup" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing"."Product" (
    "id" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "supplierId" TEXT,
    "categoryId" TEXT,
    "baseUomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing"."ProductSpec" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "lengthMm" INTEGER,
    "widthMm" INTEGER,
    "heightMm" INTEGER,
    "unitWeightKg" DOUBLE PRECISION,
    "densityKgPerM3" DOUBLE PRECISION,
    "packQty" INTEGER,
    "bricksPerPallet" INTEGER,
    "palletDimensionsMm" TEXT,
    "techSpecsLink" TEXT,
    "msdsLink" TEXT,
    "applicationNotes" TEXT,
    "factoryLeadTimeDays" INTEGER,
    "abcStockLeadTimeDays" INTEGER,
    "minOrderQty" INTEGER,
    "reorderPoint" INTEGER,
    "safetyStock" INTEGER,
    "notes" TEXT,

    CONSTRAINT "ProductSpec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing"."Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing"."Uom" (
    "id" TEXT NOT NULL,
    "code" "pricing"."UomCode" NOT NULL,
    "description" TEXT,
    "base" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Uom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "pricing"."Category"("name" ASC);

-- CreateIndex
CREATE INDEX "CostVersion_productId_effectiveFrom_idx" ON "pricing"."CostVersion"("productId" ASC, "effectiveFrom" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PriceList_costVersionId_tierId_key" ON "pricing"."PriceList"("costVersionId" ASC, "tierId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PriceTier_code_key" ON "pricing"."PriceTier"("code" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Product_itemCode_key" ON "pricing"."Product"("itemCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ProductSpec_productId_key" ON "pricing"."ProductSpec"("productId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_name_key" ON "pricing"."Supplier"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Uom_code_key" ON "pricing"."Uom"("code" ASC);

-- AddForeignKey
ALTER TABLE "pricing"."CostVersion" ADD CONSTRAINT "CostVersion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "pricing"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."PriceList" ADD CONSTRAINT "PriceList_costVersionId_fkey" FOREIGN KEY ("costVersionId") REFERENCES "pricing"."CostVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."PriceList" ADD CONSTRAINT "PriceList_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "pricing"."PriceTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."Product" ADD CONSTRAINT "Product_baseUomId_fkey" FOREIGN KEY ("baseUomId") REFERENCES "pricing"."Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "pricing"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."Product" ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "pricing"."Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing"."ProductSpec" ADD CONSTRAINT "ProductSpec_productId_fkey" FOREIGN KEY ("productId") REFERENCES "pricing"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

