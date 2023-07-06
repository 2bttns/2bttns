import { Game, GameObject } from "@prisma/client";
import { prisma } from "../db";

export default async function getRandomGameObjects(
  gameId: Game["id"],
  count: number | "ALL" = "ALL"
) {
  if (count !== "ALL" && count <= 0) {
    throw new Error("Count must be greater than 0");
  }

  const gameWithInputGameObjectIds = await prisma.game.findUniqueOrThrow({
    where: { id: gameId },
    select: {
      defaultNumItemsPerRound: true,
      inputTags: { select: { gameObjects: { select: { id: true } } } },
    },
  });

  const gameObjectIds = new Set<GameObject["id"]>();
  gameWithInputGameObjectIds.inputTags.forEach((inputTag) => {
    inputTag.gameObjects.forEach((gameObject) => {
      gameObjectIds.add(gameObject.id);
    });
  });

  const shuffledGameObjectIds = [...gameObjectIds].sort(
    () => 0.5 - Math.random()
  );

  let gameObjectsToGet = shuffledGameObjectIds;
  if (count !== "ALL" && count > 0) {
    gameObjectsToGet = shuffledGameObjectIds.slice(0, count);
  }

  const gameObjects = await prisma.gameObject.findMany({
    where: { id: { in: gameObjectsToGet } },
  });

  // Shuffle the recieved game objects because Prisma returns them in order by ID
  const shuffledGameObjects = [...gameObjects].sort(() => 0.5 - Math.random());
  return shuffledGameObjects;
}
