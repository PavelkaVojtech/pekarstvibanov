/*
  Warnings:

  - A unique constraint covering the columns `[stripeSessionId]` on the table `order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "order" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "order_stripeSessionId_key" ON "order"("stripeSessionId");
