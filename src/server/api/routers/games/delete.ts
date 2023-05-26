import { TRPCError } from "@trpc/server";
import { difference } from "lodash";
import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const deleteGames = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Delete Games",
      description: "Delete one or more Games by their IDs",
      tags: [OPENAPI_TAGS.GAMES],
      method: "DELETE",
      path: "/games",
      protect: true,
    },
  })
  .input(
    z.object({
      id: z.string().describe("Comma separated list of game IDs"),
    })
  )
  .output(
    z.object({
      deletedCount: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const ids = input.id.split(",");

    const foundGames = await ctx.prisma.game.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
      },
    });

    if (foundGames.length !== ids.length) {
      const missingIds = difference(
        ids,
        foundGames.map((game) => game.id)
      ).join(",");

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `One or more games not found: ${missingIds}`,
      });
    }

    const { count } = await ctx.prisma.game.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return {
      deletedCount: count,
    };
  });
