/*
  Warnings:

  - You are about to drop the column `mobileUserId` on the `Agent` table. All the data in the column will be lost.
  - Made the column `userId` on table `Agent` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_mobileUserId_fkey";

-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_userId_fkey";

-- DropIndex
DROP INDEX "Agent_mobileUserId_idx";

-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "mobileUserId",
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
