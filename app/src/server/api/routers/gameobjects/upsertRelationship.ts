import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const upsertRelationship = publicProcedure
  .input(
    z.object({
      fromGameObjectId: z.string(),
      toGameObjectId: z.string(),
      weightId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const weight = await ctx.prisma.weight.findFirst({
      where: {
        id: input.weightId,
      },
    });

    if (!weight) {
      throw new Error("Weight not found");
    }

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

    const upsertedRelationship = await ctx.prisma.gameObjectRelationship.upsert(
      {
        where: {
          fromGameObjectId_toGameObjectId: {
            fromGameObjectId: input.fromGameObjectId,
            toGameObjectId: input.toGameObjectId,
          },
        },
        create: {
          fromGameObject: {
            connect: {
              id: input.fromGameObjectId,
            },
          },
          toGameObject: {
            connect: {
              id: input.toGameObjectId,
            },
          },
          weight: {
            connect: {
              id: input.weightId,
            },
          },
        },
        update: {
          weight: {
            connect: {
              id: input.weightId,
            },
          },
        },
      }
    );

    return { upsertedRelationship };
  });
