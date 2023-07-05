import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
  name: z.string().optional(),
});

const output = z.object({
  createdPlayer: z.object({
    id: idSchema,
    name: z.string().nullable().optional(),
    createdAt: z.string().describe("ISO date string"),
    updatedAt: z.string().describe("ISO date string"),
  }),
});

export const create = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Create Player",
      description:
        "Creates a player with the given ID and an optional name. The ID must be unique, and ideally corresponds with a user ID used by the app integrating with 2bttns.",
      tags: [OPENAPI_TAGS.PLAYERS],
      method: "POST",
      path: "/players/create",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .mutation(async ({ input, ctx }) => {
    const createdPlayer = await ctx.prisma.player.create({
      data: {
        id: input.id,
        name: input.name,
      },
    });

    const processedCreatedPlayer: (typeof output._type)["createdPlayer"] = {
      ...createdPlayer,
      createdAt: createdPlayer.createdAt.toISOString(),
      updatedAt: createdPlayer.updatedAt.toISOString(),
    };

    return {
      createdPlayer: processedCreatedPlayer,
    };
  });
