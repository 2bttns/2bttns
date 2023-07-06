import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  gameObjectId1: idSchema,
  gameObjectId2: idSchema,
});

export const deleteRelationship = adminOrApiKeyProtectedProcedure
  .input(input)
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
