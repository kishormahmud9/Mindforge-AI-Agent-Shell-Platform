-- AlterTable
ALTER TABLE "MobileUser" ADD COLUMN     "language" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language" TEXT,
ALTER COLUMN "role" SET DEFAULT 'user';
