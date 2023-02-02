import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getAll = publicProcedure
  .input(
    z
      .object({
        take: z.number().optional(),
        skip: z.number().optional(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const games = await ctx.prisma.game.findMany({
      take: input?.take,
      skip: input?.skip,
    });
    return { games };
  });
