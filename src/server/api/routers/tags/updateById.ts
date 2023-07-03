import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
  data: z.object({
    id: idSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    addGameObjects: z.array(z.string()).optional(),
    removeGameObjects: z.array(z.string()).optional(),
  }),
});

export const updateById = adminOrApiKeyProtectedProcedure
  .input(input)
  .mutation(async ({ ctx, input }) => {
    const updatedTag = await ctx.prisma.tag.update({
      where: {
        id: input.id,
      },
      data: {
        id: input.data.id,
        name: input.data.name,
        description: input.data.description,
        gameObjects: {
          connect: input.data.addGameObjects
            ? input.data.addGameObjects.map((id) => ({ id }))
            : undefined,
          disconnect: input.data.removeGameObjects
            ? input.data.removeGameObjects.map((id) => ({ id }))
            : undefined,
        },
        updatedAt: new Date(),
      },
    });

    // Update updatedAt timestamp on all gameObjects that were connected or disconnected
    if (input.data.addGameObjects || input.data.removeGameObjects) {
      await ctx.prisma.gameObject.updateMany({
        where: {
          OR: [
            {
              id: {
                in: input.data.addGameObjects ?? [],
              },
            },
            {
              id: {
                in: input.data.removeGameObjects ?? [],
              },
            },
          ],
        },
        data: {
          updatedAt: new Date(),
        },
      });
    }

    return {
      updatedTag,
    };
  });
