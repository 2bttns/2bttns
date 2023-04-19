import { z } from "zod";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const deleteRelationship = adminOrApiKeyProtectedProcedure
  .input(
    z.object({
      gameObjectId1: z.string(),
      gameObjectId2: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const results = await ctx.prisma.$transaction([
      ctx.prisma.gameObjectRelationship.delete({
        where: {
          fromGameObjectId_toGameObjectId: {
            fromGameObjectId: input.gameObjectId1,
            toGameObjectId: input.gameObjectId2,
          },
        },
      }),
      ctx.prisma.gameObjectRelationship.delete({
        where: {
          fromGameObjectId_toGameObjectId: {
            fromGameObjectId: input.gameObjectId2,
            toGameObjectId: input.gameObjectId1,
          },
        },
      }),
    ]);

    return { results };
  });
