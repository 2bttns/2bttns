/*
  Warnings:

  - You are about to drop the `Mode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Mode";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameMode" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "gameId" TEXT NOT NULL,
    "modeId" TEXT NOT NULL,
    "modeConfigJson" TEXT,

    PRIMARY KEY ("gameId", "modeId"),
    CONSTRAINT "GameMode_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GameMode" ("createdAt", "gameId", "modeConfigJson", "modeId", "updatedAt") SELECT "createdAt", "gameId", "modeConfigJson", "modeId", "updatedAt" FROM "GameMode";
DROP TABLE "GameMode";
ALTER TABLE "new_GameMode" RENAME TO "GameMode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
