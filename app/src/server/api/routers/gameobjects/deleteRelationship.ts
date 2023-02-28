import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const deleteRelationship = publicProcedure
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
