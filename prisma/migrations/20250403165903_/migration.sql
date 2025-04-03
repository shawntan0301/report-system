/*
  Warnings:

  - You are about to drop the column `clerkId` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clerk_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerk_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_clerkId_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "clerkId",
ADD COLUMN     "clerk_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_clerk_id_key" ON "user"("clerk_id");
