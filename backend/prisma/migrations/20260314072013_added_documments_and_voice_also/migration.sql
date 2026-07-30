-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "docummentsPaths" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "docummentsUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "voicePaths" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "voiceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
