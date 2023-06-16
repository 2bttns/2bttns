import { z } from "zod";
import generateSecret from "../../../../utils/generateSecret";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema.optional(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const create = adminOrApiKeyProtectedProcedure
  .input(input)
  .mutation(async ({ input, ctx }) => {
    const createdSecret = await ctx.prisma.secret.create({
      data: {
        id: input.id,
        name: input.name,
        description: input.description,
        secret: generateSecret(),
      },
    });

    return {
      createdSecret,
    };
  });
