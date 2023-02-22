/*
  Warnings:

  - The primary key for the `PlayerScore` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `PlayerScore` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlayerScore" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "score" DECIMAL NOT NULL,
    "playerId" TEXT NOT NULL,
    "gameObjectId" TEXT NOT NULL,

    PRIMARY KEY ("playerId", "gameObjectId"),
    CONSTRAINT "PlayerScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerScore_gameObjectId_fkey" FOREIGN KEY ("gameObjectId") REFERENCES "GameObject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlayerScore" ("createdAt", "gameObjectId", "playerId", "score", "updatedAt") SELECT "createdAt", "gameObjectId", "playerId", "score", "updatedAt" FROM "PlayerScore";
DROP TABLE "PlayerScore";
ALTER TABLE "new_PlayerScore" RENAME TO "PlayerScore";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
