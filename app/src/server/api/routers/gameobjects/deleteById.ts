import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const deleteById = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const deletedGameObject = await ctx.prisma.gameObject.delete({
      where: {
        id: input.id,
      },
    });
    return { deletedGameObject };
  });
