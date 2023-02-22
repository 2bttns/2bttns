-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT
);
INSERT INTO "new_Player" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE TABLE "new_PlayerScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "score" DECIMAL NOT NULL,
    "playerId" TEXT NOT NULL,
    "gameObjectId" TEXT NOT NULL,
    CONSTRAINT "PlayerScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerScore_gameObjectId_fkey" FOREIGN KEY ("gameObjectId") REFERENCES "GameObject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlayerScore" ("createdAt", "gameObjectId", "id", "playerId", "score", "updatedAt") SELECT "createdAt", "gameObjectId", "id", "playerId", "score", "updatedAt" FROM "PlayerScore";
DROP TABLE "PlayerScore";
ALTER TABLE "new_PlayerScore" RENAME TO "PlayerScore";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
