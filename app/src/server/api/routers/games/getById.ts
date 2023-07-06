import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
  includeGameObjects: z.boolean().optional(),
});

export const getById = adminOrApiKeyProtectedProcedure
  .input(input)
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
