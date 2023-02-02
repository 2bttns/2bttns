import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const updateGameById = publicProcedure
  .input(
    z.object({
      id: z.string(),
      data: z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        plugins: z.string().optional(),
      }),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const updatedGame = await ctx.prisma.game.update({
      where: {
        id: input.id,
      },
      data: {
        id: input.data.id,
        name: input.data.name,
        description: input.data.description,
        plugins: input.data.plugins,
      },
    });

    return {
      updatedGame,
    };
  });
