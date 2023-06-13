import { z } from "zod";
import generateSecret from "../../../../utils/generateSecret";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
  data: z
    .object({
      id: idSchema.optional(),
      name: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  generateNewSecret: z.boolean().optional().default(false),
});

export const updateById = adminOrApiKeyProtectedProcedure
  .input(input)
  .mutation(async ({ ctx, input }) => {
    const updatedSecret = await ctx.prisma.secret.update({
      where: {
        id: input.id,
      },
      data: {
        id: input.data?.id,
        name: input.data?.name,
        description: input.data?.description,
        secret: input.generateNewSecret ? generateSecret() : undefined,
      },
    });

    return {
      updatedSecret,
    };
  });
