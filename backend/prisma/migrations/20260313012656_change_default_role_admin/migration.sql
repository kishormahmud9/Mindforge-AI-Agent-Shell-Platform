/*
  Warnings:

  - The values [staff,customer] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('system_owner', 'business_owner', 'admin', 'user');
ALTER TABLE "public"."MobileUser" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TABLE "MobileUser" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "MobileUser" ALTER COLUMN "role" SET DEFAULT 'user';
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'admin';
COMMIT;

-- AlterTable
ALTER TABLE "MobileUser" ALTER COLUMN "role" SET DEFAULT 'user';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'admin';
