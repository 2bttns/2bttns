import { z } from "zod";
import { anyAuthProtectedProcedure } from "../../trpc";

export const getById = anyAuthProtectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const tag = await ctx.prisma.tag.findFirst({
      where: {
        id: input.id,
      },
    });

    if (!tag) {
      throw new Error(`Tag with id='${input.id}' not found`);
    }

    return { tag };
  });
