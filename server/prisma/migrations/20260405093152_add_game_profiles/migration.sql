/*
  Warnings:

  - You are about to drop the column `favoriteGame` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "achievements" ADD COLUMN     "game" TEXT;

-- AlterTable
ALTER TABLE "coin_transactions" ADD COLUMN     "game" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "favoriteGame",
DROP COLUMN "platform";

-- CreateTable
CREATE TABLE "user_game_profiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "game" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "gameUserId" TEXT NOT NULL DEFAULT '',
    "rank" TEXT NOT NULL DEFAULT '',
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "tournamentsPlayed" INTEGER NOT NULL DEFAULT 0,
    "coinsEarned" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_game_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_game_profiles_userId_game_key" ON "user_game_profiles"("userId", "game");

-- AddForeignKey
ALTER TABLE "user_game_profiles" ADD CONSTRAINT "user_game_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
