import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  try {
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

    const exampleGame1 = await prisma.game.create({
      data: {
        id: "example-game-1",
        name: "Example Game 1",
        description: "This is an example game.",
        plugins: "example-plugin-1,example-plugin-2",
      },
    });
    console.log("Created example game 1");
  } catch {}

  try {
    const exampleGame2 = await prisma.game.create({
      data: {
        id: "example-game-2",
        name: "Example Game 2",
        description: "This is another example game.",
      },
    });
    console.log("Created example game 2");
  } catch {}

  const createGameObjects = Array.from({ length: 50 }).map((_, i) => {
    return new Promise<void>((resolve) => {
      prisma.gameObject
        .create({
          data: {
            id: `example-game-object-${i}`,
            name: `Example Game Object ${i}`,
            description: "This is an example game object.",
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
