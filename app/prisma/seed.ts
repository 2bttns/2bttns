import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { defaultMode } from "../src/modes/availableModes";
import { logger } from "../src/utils/logger";
const prisma = new PrismaClient();
async function main() {
  // Seed initial admin allow list using adminAllowList.json
  // const adminAllowList = fs.readFileSync(path.resolve(process.cwd(), '')
  const pathToAdminAllowList = path.resolve(
    process.cwd(),
    "adminAllowList.json"
  );
  if (fs.existsSync(pathToAdminAllowList)) {
    const file = fs.readFileSync(pathToAdminAllowList, "utf8");
    const data = JSON.parse(file) as unknown;
    const allowedAdmins = z.array(z.string()).parse(data);
    logger.info(
      `[Admin Allow List] Found ${allowedAdmins.length} admin emails in adminAllowList.json`
    );

    const createAdmins = allowedAdmins.map((email) => {
      return new Promise<void>((resolve) => {
        prisma.allowedAdmin
          .create({
            data: {
              email,
            },
          })
          .then((result) => {
            logger.info(
              `[Admin Allow List] Admin email added: ${result.email}`
            );
          })
          .catch(() => {
            logger.warn(
              `[Admin Allow List] Admin email already exists: ${email}; skipping.`
            );
          })
          .finally(() => {
            resolve();
          });
      });
    });
    await Promise.all(createAdmins);
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
    console.log(`Created Secret: ${secret.id}`);
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
