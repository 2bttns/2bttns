import { z } from "zod";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const deleteById = adminOrApiKeyProtectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const deletedSecret = await ctx.prisma.secret.delete({
      where: {
        id: input.id,
      },
    });
    return { deletedSecret };
  });
