import { z } from "zod";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const getById = adminOrApiKeyProtectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const weight = await ctx.prisma.weight.findFirst({
      where: {
        id: input.id,
      },
    });

    return { weight };
  });
