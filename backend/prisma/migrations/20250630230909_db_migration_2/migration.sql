-- DropForeignKey
ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_subHubId_fkey";

-- DropForeignKey
ALTER TABLE "FlashCard" DROP CONSTRAINT "FlashCard_subHubId_fkey";

-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_postId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_subHubId_fkey";

-- DropForeignKey
ALTER TABLE "SubHub" DROP CONSTRAINT "SubHub_learningHubId_fkey";

-- DropForeignKey
ALTER TABLE "SubHubComment" DROP CONSTRAINT "SubHubComment_subHubId_fkey";

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubHub" ADD CONSTRAINT "SubHub_learningHubId_fkey" FOREIGN KEY ("learningHubId") REFERENCES "LearningHub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_subHubId_fkey" FOREIGN KEY ("subHubId") REFERENCES "SubHub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubHubComment" ADD CONSTRAINT "SubHubComment_subHubId_fkey" FOREIGN KEY ("subHubId") REFERENCES "SubHub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashCard" ADD CONSTRAINT "FlashCard_subHubId_fkey" FOREIGN KEY ("subHubId") REFERENCES "SubHub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_subHubId_fkey" FOREIGN KEY ("subHubId") REFERENCES "SubHub"("id") ON DELETE CASCADE ON UPDATE CASCADE;
