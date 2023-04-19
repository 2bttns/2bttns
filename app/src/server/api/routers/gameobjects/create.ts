import { z } from "zod";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const create = adminOrApiKeyProtectedProcedure
  .input(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      description: z.string().optional(),
      tags: z
        .array(
          z.object({
            id: z.string().optional(),
          })
        )
        .optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const createdGameObject = await ctx.prisma.gameObject.create({
      data: {
        id: input.id,
        name: input.name,
        description: input.description,
        tags: {
          connect: input.tags?.map((tag) => ({
            id: tag.id,
          })),
        },
      },
    });

    return {
      createdGameObject,
    };
  });
