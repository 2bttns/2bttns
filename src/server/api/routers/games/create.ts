import { z } from "zod";
import { defaultMode } from "../../../../modes/availableModes";
import { idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema.optional(),
  name: z.string(),
  description: z.string().optional(),
});

export const create = adminOrApiKeyProtectedProcedure
  .input(input)
  .mutation(async ({ input, ctx }) => {
    const createdGame = await ctx.prisma.game.create({
      data: {
        id: input.id,
        name: input.name,
        description: input.description,
        mode: defaultMode,
      },
    });

    return {
      createdGame,
    };
  });
