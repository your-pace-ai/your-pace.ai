-- AlterTable
ALTER TABLE "SubHub" ADD COLUMN     "youtubeUrl" TEXT;

-- CreateTable
CREATE TABLE "AiContextWindow" (
    "id" SERIAL NOT NULL,
    "context" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AiContextWindow_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiContextWindow" ADD CONSTRAINT "AiContextWindow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
