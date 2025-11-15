/*
  Warnings:

  - You are about to drop the column `firebaseUid` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[supabaseUid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `supabaseUid` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_firebaseUid_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firebaseUid",
ADD COLUMN     "supabaseUid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseUid_key" ON "User"("supabaseUid");
