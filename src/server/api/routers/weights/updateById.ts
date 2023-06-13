import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
  data: z.object({
    id: idSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    weight: z.number().optional(),
  }),
});

export const updateById = adminOrApiKeyProtectedProcedure
  .input(input)
  .mutation(async ({ ctx, input }) => {
    const deletedWeight = await ctx.prisma.weight.update({
      where: {
        id: input.id,
      },
      data: {
        id: input.data.id,
        name: input.data.name,
        description: input.data.description,
        weight: input.data.weight,
      },
    });
    return { deletedWeight };
  });
