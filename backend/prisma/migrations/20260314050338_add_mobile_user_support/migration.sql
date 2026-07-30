-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_userId_fkey";

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "mobileUserId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Instance" ADD COLUMN     "mobileUserId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Agent_mobileUserId_idx" ON "Agent"("mobileUserId");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_mobileUserId_fkey" FOREIGN KEY ("mobileUserId") REFERENCES "MobileUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instance" ADD CONSTRAINT "Instance_mobileUserId_fkey" FOREIGN KEY ("mobileUserId") REFERENCES "MobileUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
