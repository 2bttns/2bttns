import { TRPCError } from "@trpc/server";
import { output, z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { publicProcedure } from "../../trpc";

const output = z.object({
  player: z.object({
    id: z.string(),
    name: z.string().nullable().optional(),
    createdAt: z.string().describe("ISO date string"),
    updatedAt: z.string().describe("ISO date string"),
  }),
});

export const getById = publicProcedure
  .meta({
    openapi: {
      summary: "Get Player by ID",
      description: "Get player by ID",
      tags: [OPENAPI_TAGS.PLAYERS],
      method: "GET",
      path: "/players/{id}",
    },
  })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .output(output)
  .mutation(async ({ input, ctx }) => {
    try {
      const player = await ctx.prisma.player.findFirstOrThrow({
        where: {
          id: input.id,
        },
      });
      const processedPlayer: typeof output._type["player"] = {
        ...player,
        createdAt: player.createdAt.toISOString(),
        updatedAt: player.updatedAt.toISOString(),
      };

      return {
        player: processedPlayer,
      };
    } catch (error) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Player with id='${input.id}' not found`,
      });
    }
  });
