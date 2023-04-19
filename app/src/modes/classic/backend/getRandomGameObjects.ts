import { z } from "zod";
import { anyAuthProtectedProcedure } from "../../../server/api/trpc";

export const getRandomGameObjects = anyAuthProtectedProcedure
  .input(
    z.object({
      count: z.number().optional(),
      excludedGameObjectIds: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { count, excludedGameObjectIds, tags } = input;

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
                id: {
                  in: tags,
                },
              },
            }
          : undefined,
      },
    });

    const shuffled = gameObjects.sort(() => 0.5 - Math.random());
    let selected = shuffled;
    if (count) {
      selected = shuffled.slice(0, count);
    }

    return { results: selected };
  });
