/*
  Warnings:

  - You are about to drop the column `googleId` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_googleId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "googleId";
