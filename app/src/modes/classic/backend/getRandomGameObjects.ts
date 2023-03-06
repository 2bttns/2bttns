import { z } from "zod";
import { publicProcedure } from "../../../server/api/trpc";

export const getRandomGameObjects = publicProcedure
  .input(
    z.object({
      numGameObjects: z.number(),
      excludedGameObjectIds: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { numGameObjects, excludedGameObjectIds, tags } = input;

    const gameObjects = await ctx.prisma.gameObject.findMany({
      where: {
        id: excludedGameObjectIds
          ? {
              notIn: excludedGameObjectIds,
            }
          : undefined,
        tags: tags
          ? {
              some: {
                name: {
                  in: tags,
                },
              },
            }
          : undefined,
      },
    });

    const shuffled = gameObjects.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numGameObjects);

    return { results: selected };
  });
