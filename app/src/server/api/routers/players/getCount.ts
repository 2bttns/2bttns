import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const getCount = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get Player Count",
      description: "Get player count",
      tags: [OPENAPI_TAGS.PLAYERS],
      method: "GET",
      path: "/players/count",
      protect: true,
    },
  })
  .input(z.void())
  .output(
    z.object({
      count: z.number(),
    })
  )
  .query(async ({ input, ctx }) => {
    const count = await ctx.prisma.player.count();

    return {
      count,
    };
  });
