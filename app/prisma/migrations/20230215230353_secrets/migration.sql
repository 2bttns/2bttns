-- CreateTable
CREATE TABLE "Secret" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "secret" TEXT NOT NULL
);
