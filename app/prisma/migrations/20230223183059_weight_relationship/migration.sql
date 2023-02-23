-- CreateTable
CREATE TABLE "Weight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "weight" DECIMAL NOT NULL
);

-- CreateTable
CREATE TABLE "GameObjectRelationship" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "weightId" TEXT NOT NULL,
    "fromGameObjectId" TEXT NOT NULL,
    "toGameObjectId" TEXT NOT NULL,

    PRIMARY KEY ("fromGameObjectId", "toGameObjectId"),
    CONSTRAINT "GameObjectRelationship_weightId_fkey" FOREIGN KEY ("weightId") REFERENCES "Weight" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GameObjectRelationship_fromGameObjectId_fkey" FOREIGN KEY ("fromGameObjectId") REFERENCES "GameObject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GameObjectRelationship_toGameObjectId_fkey" FOREIGN KEY ("toGameObjectId") REFERENCES "GameObject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
