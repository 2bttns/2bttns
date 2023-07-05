import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
  includeTags: z.boolean().optional().default(false),
});

export const getById = adminOrApiKeyProtectedProcedure
  .input(input)
  .query(async ({ ctx, input }) => {
    const gameObject = await ctx.prisma.gameObject.findFirst({
      where: {
        id: input.id,
      },
      include: {
        tags: input.includeTags,
      },
    });

    return { gameObject };
  });
