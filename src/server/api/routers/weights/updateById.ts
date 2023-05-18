import { z } from "zod";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const updateById = adminOrApiKeyProtectedProcedure
  .input(
    z.object({
      id: z.string(),
      data: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        weight: z.number().optional(),
      }),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const deletedWeight = await ctx.prisma.weight.update({
      where: {
        id: input.id,
      },
      data: {
        name: input.data.name,
        description: input.data.description,
        weight: input.data.weight,
      },
    });
    return { deletedWeight };
  });
