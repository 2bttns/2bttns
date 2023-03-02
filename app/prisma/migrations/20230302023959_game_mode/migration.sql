-- CreateTable
CREATE TABLE "Mode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "GameMode" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "gameId" TEXT NOT NULL,
    "modeId" TEXT NOT NULL,

    PRIMARY KEY ("gameId", "modeId"),
    CONSTRAINT "GameMode_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GameMode_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "Mode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
