import { z } from "zod";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const create = adminOrApiKeyProtectedProcedure
  .input(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      description: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const createdTag = await ctx.prisma.tag.create({
      data: {
        id: input.id,
        name: input.name,
        description: input.description,
      },
    });

    return {
      createdTag,
    };
  });