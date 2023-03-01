import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const updateById = publicProcedure
  .input(
    z.object({
      id: z.string(),
      data: z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        inputTags: z.array(z.string()).optional(),
        defaultNumItemsPerRound: z.number().nullable().optional(),
      }),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const updatedGameObject = await ctx.prisma.game.update({
      where: {
        id: input.id,
      },
      data: {
        id: input.data.id,
        name: input.data.name,
        description: input.data.description,
        updatedAt: new Date(), // Explicit update of updatedAt; otherwise inputTags.set won't trigger the default updatedAt update
        inputTags: {
          set: input.data.inputTags?.map((tag) => ({ id: tag })),
        },
        defaultNumItemsPerRound: input.data.defaultNumItemsPerRound,
      },
    });

    return {
      updatedGameObject,
    };
  });
