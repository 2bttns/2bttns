import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
});

export const deleteById = adminOrApiKeyProtectedProcedure
  .input(input)
  .mutation(async ({ ctx, input }) => {
    const deletedSecret = await ctx.prisma.secret.delete({
      where: {
        id: input.id,
      },
    });
    return { deletedSecret };
  });
