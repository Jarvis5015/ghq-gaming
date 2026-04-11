-- CreateEnum
CREATE TYPE "PaymentCodeStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "registrations" ADD COLUMN     "paymentCode" TEXT;

-- CreateTable
CREATE TABLE "payment_codes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentCodeStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_codes_code_key" ON "payment_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "payment_codes_userId_tournamentId_key" ON "payment_codes"("userId", "tournamentId");

-- AddForeignKey
ALTER TABLE "payment_codes" ADD CONSTRAINT "payment_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_codes" ADD CONSTRAINT "payment_codes_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
