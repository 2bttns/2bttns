import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema.optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  weight: z.number().optional(),
});

export const create = adminOrApiKeyProtectedProcedure
  .input(input)
  .mutation(async ({ input, ctx }) => {
    const createdWeight = await ctx.prisma.weight.create({
      data: {
        id: input.id,
        name: input.name,
        description: input.description,
        weight: input.weight ?? 0,
      },
    });

    return { createdWeight };
  });
