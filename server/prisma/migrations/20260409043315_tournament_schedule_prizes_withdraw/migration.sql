-- CreateEnum
CREATE TYPE "WithdrawStatus" AS ENUM ('PENDING', 'PAID', 'REJECTED');

-- AlterEnum
ALTER TYPE "TournamentStatus" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "registrations" ADD COLUMN     "gollarsWon" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "prizeTiers" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "registrationEnd" TIMESTAMP(3),
ADD COLUMN     "registrationStart" TIMESTAMP(3),
ADD COLUMN     "tournamentEnd" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "withdraw_requests" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "upiId" TEXT NOT NULL,
    "upiName" TEXT NOT NULL DEFAULT '',
    "status" "WithdrawStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdraw_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "withdraw_requests" ADD CONSTRAINT "withdraw_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
