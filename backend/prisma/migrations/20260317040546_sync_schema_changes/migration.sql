/*
  Warnings:

  - You are about to drop the column `mobileUserId` on the `Instance` table. All the data in the column will be lost.
  - You are about to drop the `MobileUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Instance" DROP CONSTRAINT "Instance_mobileUserId_fkey";

-- AlterTable
ALTER TABLE "Instance" DROP COLUMN "mobileUserId",
ADD COLUMN     "userRole" "UserRole";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "userRole" "UserRole";

-- DropTable
DROP TABLE "MobileUser";
