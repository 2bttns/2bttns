import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const output = z.object({
  id: idSchema.optional(),
  name: z.string(),
  description: z.string().optional(),
  tags: z
    .array(
      z.object({
        id: idSchema.optional(),
      })
    )
    .optional(),
});

export const create = adminOrApiKeyProtectedProcedure
  .input(output)
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
