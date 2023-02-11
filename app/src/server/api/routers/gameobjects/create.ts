import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const create = publicProcedure
  .input(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      description: z.string().optional(),
      tags: z
        .array(
          z.object({
            id: z.string().optional(),
            name: z.string(),
            description: z.string().optional(),
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
          connectOrCreate: input.tags?.map((tag) => ({
            where: { id: tag.id },
            create: {
              id: tag.id,
              name: tag.name,
              description: tag.description,
            },
          })),
        },
      },
    });

    return {
      createdGameObject,
    };
  });
