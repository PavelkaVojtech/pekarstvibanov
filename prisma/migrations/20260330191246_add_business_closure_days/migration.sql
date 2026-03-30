-- CreateEnum
CREATE TYPE "ClosureType" AS ENUM ('CLOSED', 'MODIFIED');

-- CreateTable
CREATE TABLE "business_closure_day" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" "ClosureType" NOT NULL,
    "altOpeningHours" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_closure_day_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_closure_day_date_key" ON "business_closure_day"("date");
