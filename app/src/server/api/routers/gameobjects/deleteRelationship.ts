import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const deleteRelationship = publicProcedure
  .input(
    z.object({
      fromGameObjectId: z.string(),
      toGameObjectId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const deletedRelationship = await ctx.prisma.gameObjectRelationship.delete({
      where: {
        fromGameObjectId_toGameObjectId: {
          fromGameObjectId: input.fromGameObjectId,
          toGameObjectId: input.toGameObjectId,
        },
      },
    });

    return { deletedRelationship };
  });
