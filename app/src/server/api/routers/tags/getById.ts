import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
});

export const getById = adminOrApiKeyProtectedProcedure
  .input(input)
  .query(async ({ ctx, input }) => {
    const tag = await ctx.prisma.tag.findFirst({
      where: {
        id: input.id,
      },
    });

    if (!tag) {
      throw new Error(`Tag with id='${input.id}' not found`);
    }

    return { tag };
  });
