/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "googleId" TEXT,
ALTER COLUMN "passwordHash" SET DEFAULT '',
ALTER COLUMN "coins" SET DEFAULT 100,
ALTER COLUMN "totalEarned" SET DEFAULT 100,
ALTER COLUMN "gollers" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
