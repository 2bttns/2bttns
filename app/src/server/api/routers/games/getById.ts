import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getById = publicProcedure
  .input(
    z.object({
      id: z.string(),
      includeGameObjects: z.boolean().optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    const game = await ctx.prisma.game.findFirst({
      where: {
        id: input.id,
      },
      include: {
        inputTags: input.includeGameObjects
          ? {
              include: {
                gameObjects: true,
              },
            }
          : undefined,
      },
    });

    if (!game) {
      throw new Error(`Game with id ${input.id} not found`);
    }

    return { game };
  });
