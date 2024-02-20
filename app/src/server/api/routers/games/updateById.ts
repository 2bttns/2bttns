import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
  data: z.object({
    id: idSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    inputTags: z.array(z.string()).optional(),
    defaultNumItemsPerRound: z.number().nullable().optional(),
    mode: z.string().optional(),
    modeConfigJson: z.string().optional(),
    customCss: z.string().optional(),
  }),
});

export const updateById = adminOrApiKeyProtectedProcedure
  .input(input)
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
        mode: input.data.mode,
        modeConfigJson: input.data.modeConfigJson,
        customCss: input.data.customCss,
      },
    });

    return {
      updatedGameObject,
    };
  });
