/*
  Warnings:

  - Made the column `cvFile` on table `Application` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cvFileName` on table `Application` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cvMimeType` on table `Application` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "cvFile" SET NOT NULL,
ALTER COLUMN "cvFileName" SET NOT NULL,
ALTER COLUMN "cvMimeType" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
