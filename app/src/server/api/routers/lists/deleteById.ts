import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const deleteById = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const deletedList = await ctx.prisma.list.delete({
      where: {
        id: input.id,
      },
    });
    return { deletedList };
  });
