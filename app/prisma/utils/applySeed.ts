import { PrismaClient } from "@prisma/client";
import { defaultMode } from "../../src/modes/availableModes";

export async function applySeed(prisma: PrismaClient) {
  await prisma.$connect();

  // Ensure tables exist. If they don't, it means the migrations likely haven't been run.
  try {
    await prisma.secret.count();
    await prisma.game.count();
    await prisma.tag.count();
    await prisma.gameObject.count();
    await prisma.weight.count();
  } catch {
    throw new Error(
      `Missing one or more tables. This indicates that the necessary 2bttns Prisma migrations may not have been applied to the database.`
    );
  }

  // Demo seed data -- example secret, weights, game objects, tags, and games
  try {
    const secret = await prisma.secret.create({
      data: {
        id: "example-app",
        name: `example-secret`,
        secret: `example-secret-value`,
      },
    });
    console.info(`Created Secret: ${secret.id}`);
  } catch {}

  const createWeights = [
    { name: "LOW", value: 0.1 },
    { name: "MEDIUM", value: 0.25 },
    { name: "HIGH", value: 0.5 },
  ].map((weight, i) => {
    return new Promise<void>((resolve) => {
      prisma.weight
        .create({
          data: {
            id: weight.name,
            name: weight.name,
            weight: weight.value,
          },
        })
        .then((result) => {
          console.info(`Created Weight: ${result.id}`);
        })
        .catch(() => {})
        .finally(() => {
          resolve();
        });
    });
  });
  await Promise.all(createWeights);

  const createGameObjects = Array.from({ length: 50 }).map((_, i) => {
    return new Promise<void>((resolve) => {
      prisma.gameObject
        .create({
          data: {
            id: `example-game-object-${i}`,
            name: `Example Game Object ${i}`,
            description: "This is an example game object.",
            tags: {
              connectOrCreate: {
                where: {
                  id: `example-tag`,
                },
                create: {
                  id: `example-tag`,
                  name: `Example Tag`,
                },
              },
            },
          },
        })
        .then((result) => {
          console.info(`Created ${result.id}`);
        })
        .catch(() => {})
        .finally(() => {
          resolve();
        });
    });
  });
  await Promise.all(createGameObjects);

  const createGames = Array.from({ length: 2 }).map((_, i) => {
    return new Promise<void>((resolve) => {
      prisma.game
        .create({
          data: {
            id: `example-game-${i}`,
            name: `Example Game ${i}`,
            description: "This is an example game",
            mode: defaultMode,
            inputTags: {
              connectOrCreate: {
                where: {
                  id: `example-tag`,
                },
                create: {
                  id: `example-tag`,
                  name: `Example Tag`,
                },
              },
            },
          },
        })
        .then((result) => {
          console.info(`Created ${result.id}`);
        })
        .catch(() => {})
        .finally(() => {
          resolve();
        });
    });
  });
  await Promise.all(createGames);
}
