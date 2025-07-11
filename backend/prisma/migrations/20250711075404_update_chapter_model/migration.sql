/*
  Warnings:

  - You are about to drop the column `content` on the `Chapter` table. All the data in the column will be lost.
  - Added the required column `summary` to the `Chapter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Chapter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chapter" DROP COLUMN "content",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "summary" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
