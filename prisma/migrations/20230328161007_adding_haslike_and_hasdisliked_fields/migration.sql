-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "hasDisliked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasLiked" BOOLEAN NOT NULL DEFAULT false;
