import { z } from "zod";
import { anyAuthProtectedProcedure } from "../../trpc";

export const getById = anyAuthProtectedProcedure
  .input(
    z.object({
      id: z.string(),
      includeTags: z.boolean().optional().default(false),
    })
  )
  .query(async ({ ctx, input }) => {
    const gameObject = await ctx.prisma.gameObject.findFirst({
      where: {
        id: input.id,
      },
      include: {
        tags: input.includeTags,
      },
    });

    return { gameObject };
  });
