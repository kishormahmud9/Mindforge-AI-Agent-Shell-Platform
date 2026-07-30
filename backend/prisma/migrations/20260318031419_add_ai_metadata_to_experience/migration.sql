-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "completionTokens" INTEGER,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "promptTokens" INTEGER,
ADD COLUMN     "totalTokens" INTEGER;
