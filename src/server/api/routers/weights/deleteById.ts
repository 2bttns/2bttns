import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
});

export const deleteById = adminOrApiKeyProtectedProcedure
  .input(input)
  .mutation(async ({ ctx, input }) => {
    const deletedWeight = await ctx.prisma.weight.delete({
      where: {
        id: input.id,
      },
    });
    return { deletedWeight };
  });
