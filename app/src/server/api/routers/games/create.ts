import { z } from "zod";
import { defaultMode } from "../../../../modes/availableModes";
import { idSchema } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema.optional(),
  name: z.string(),
  description: z.string().optional(),
});

const output = z.object({
  createdGame: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string().describe("ISO date string"),
    updatedAt: z.string().describe("ISO date string"),
    mode: z.string(),
  }),
});

export const create = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Create Game",
      description: "Create a new Game",
      tags: [OPENAPI_TAGS.GAMES],
      method: "POST",
      path: "/games",
      protect: true,
    },
  })
  .input(input)
  .output(output)
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
      createdGame: {
        id: createdGame.id,
        name: createdGame.name,
        description: createdGame.description,
        createdAt: createdGame.createdAt.toISOString(),
        updatedAt: createdGame.updatedAt.toISOString(),
        mode: createdGame.mode,
      },
    };
  });
