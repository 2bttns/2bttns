import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { publicProcedure } from "../../trpc";

export const getAll = publicProcedure
  .meta({
    openapi: {
      summary: "Get All Players",
      description: "Get all players",
      tags: [OPENAPI_TAGS.PLAYERS],
      method: "GET",
      path: "/players",
    },
  })
  .input(z.void())
  .output(
    z.object({
      players: z.array(
        z.object({
          id: z.string(),
          name: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
        })
      ),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const players = await ctx.prisma.player.findMany({});

    return {
      players,
    };
  });
