import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const gamesRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.prisma.game.create({
        data: {
          id: input.id,
          name: input.name,
          description: input.description,
        },
      });

      return {
        id: result.id,
      };
    }),

  getAll: publicProcedure
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
    }),
});
