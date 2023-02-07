import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getById = publicProcedure
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
        Tags: input.includeTags,
      },
    });

    return { gameObject };
  });
