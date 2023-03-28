/*
  Warnings:

  - You are about to drop the column `deslike` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "deslike",
ADD COLUMN     "dislike" INTEGER NOT NULL DEFAULT 0;
