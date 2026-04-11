/*
  Warnings:

  - You are about to drop the column `paymentCode` on the `registrations` table. All the data in the column will be lost.
  - You are about to drop the column `coinsEarned` on the `user_game_profiles` table. All the data in the column will be lost.
  - You are about to drop the `payment_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TopUpStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'EXPIRED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "payment_codes" DROP CONSTRAINT "payment_codes_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "payment_codes" DROP CONSTRAINT "payment_codes_userId_fkey";

-- AlterTable
ALTER TABLE "registrations" DROP COLUMN "paymentCode",
ADD COLUMN     "gollersPaid" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user_game_profiles" DROP COLUMN "coinsEarned",
ADD COLUMN     "gollersSpent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gollers" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN     "totalBought" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "payment_codes";

-- DropEnum
DROP TYPE "PaymentCodeStatus";

-- CreateTable
CREATE TABLE "goller_top_ups" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "TopUpStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goller_top_ups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "goller_top_ups_code_key" ON "goller_top_ups"("code");

-- AddForeignKey
ALTER TABLE "goller_top_ups" ADD CONSTRAINT "goller_top_ups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
