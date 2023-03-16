/*
  Warnings:

  - You are about to drop the column `plugins` on the `Game` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultNumItemsPerRound" INTEGER,
    "mode" TEXT,
    "modeConfigJson" TEXT
);
INSERT INTO "new_Game" ("createdAt", "defaultNumItemsPerRound", "description", "id", "mode", "modeConfigJson", "name", "updatedAt") SELECT "createdAt", "defaultNumItemsPerRound", "description", "id", "mode", "modeConfigJson", "name", "updatedAt" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
