import { z } from "zod";
import { anyAuthProtectedProcedure } from "../../trpc";

export const getById = anyAuthProtectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const secret = await ctx.prisma.secret.findFirst({
      where: {
        id: input.id,
      },
    });

    return { secret };
  });
