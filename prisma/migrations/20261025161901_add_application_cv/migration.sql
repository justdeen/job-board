-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "cvFile" BYTEA,
ADD COLUMN     "cvFileName" TEXT,
ADD COLUMN     "cvMimeType" TEXT;
