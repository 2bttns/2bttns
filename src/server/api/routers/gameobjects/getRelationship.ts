import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  fromGameObjectId: idSchema,
  toGameObjectId: idSchema,
});

export const getRelationship = adminOrApiKeyProtectedProcedure
  .input(input)
  .query(async ({ ctx, input }) => {
    const fromGameObject = await ctx.prisma.gameObject.findFirst({
      where: {
        id: input.fromGameObjectId,
      },
    });

    if (!fromGameObject) {
      throw new Error("From GameObject not found");
    }

    const toGameObject = await ctx.prisma.gameObject.findFirst({
      where: {
        id: input.toGameObjectId,
      },
    });

    if (!toGameObject) {
      throw new Error("To GameObject not found");
    }

    const relationship = await ctx.prisma.gameObjectRelationship.findFirst({
      where: {
        fromGameObjectId: input.fromGameObjectId,
        toGameObjectId: input.toGameObjectId,
      },
    });

    return { relationship };
  });
