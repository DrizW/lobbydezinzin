/*
  Warnings:

  - You are about to drop the `DnsServer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DnsServer";

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "kdRange" TEXT NOT NULL,
    "kdValue" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "dnsPrimary" TEXT NOT NULL,
    "dnsSecondary" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");
