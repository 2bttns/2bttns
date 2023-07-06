import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const output = z.object({
  players: z.array(
    z.object({
      id: z.string(),
      name: z.string().nullable().optional(),
      createdAt: z.string().describe("ISO date string"),
      updatedAt: z.string().describe("ISO date string"),
    })
  ),
});

export const getAll = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get All Players",
      description: "Get all players",
      tags: [OPENAPI_TAGS.PLAYERS],
      method: "GET",
      path: "/players",
      protect: true,
    },
  })
  .input(z.void())
  .output(output)
  .query(async ({ input, ctx }) => {
    const players = await ctx.prisma.player.findMany();

    const processedPlayers = players.map((player) => {
      return {
        id: player.id,
        name: player.name,
        createdAt: player.createdAt.toISOString(),
        updatedAt: player.updatedAt.toISOString(),
      };
    });

    return {
      players: processedPlayers,
    };
  });
