import { z } from "zod";
import { anyAuthProtectedProcedure } from "../../trpc";

export const deleteById = anyAuthProtectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const deletedWeight = await ctx.prisma.weight.delete({
      where: {
        id: input.id,
      },
    });
    return { deletedWeight };
  });
