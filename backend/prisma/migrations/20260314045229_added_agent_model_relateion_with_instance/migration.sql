/*
  Warnings:

  - Added the required column `agentId` to the `Instance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Instance" ADD COLUMN     "agentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Instance" ADD CONSTRAINT "Instance_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
