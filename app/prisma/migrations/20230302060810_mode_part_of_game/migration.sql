/*
  Warnings:

  - You are about to drop the `GameMode` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN "mode" TEXT;
ALTER TABLE "Game" ADD COLUMN "modeConfigJson" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GameMode";
PRAGMA foreign_keys=on;
