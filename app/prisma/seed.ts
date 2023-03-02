import { PrismaClient } from "@prisma/client";
import { defaultMode } from "../src/modes/availableModes";
const prisma = new PrismaClient();
async function main() {
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
          console.log(`Created Weight: ${result.id}`);
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
          console.log(`Created ${result.id}`);
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
          console.log(`Created ${result.id}`);
        })
        .catch(() => {})
        .finally(() => {
          resolve();
        });
    });
  });
  await Promise.all(createGames);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
