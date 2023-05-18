import { z } from "zod";
import { defaultMode } from "../../../../modes/availableModes";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const create = adminOrApiKeyProtectedProcedure
  .input(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      description: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const createdGame = await ctx.prisma.game.create({
      data: {
        id: input.id,
        name: input.name,
        description: input.description,
        mode: defaultMode,
      },
    });

    return {
      createdGame,
    };
  });
