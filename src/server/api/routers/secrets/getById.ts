import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
});

export const getById = adminOrApiKeyProtectedProcedure
  .input(input)
  .query(async ({ ctx, input }) => {
    const secret = await ctx.prisma.secret.findFirst({
      where: {
        id: input.id,
      },
    });

    return { secret };
  });
