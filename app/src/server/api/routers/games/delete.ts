import { TRPCError } from "@trpc/server";
import { difference } from "lodash";
import { z } from "zod";
import { commaSeparatedStringToArray } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: commaSeparatedStringToArray.describe("Comma separated list of game IDs"),
});

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
  .input(input)
  .output(
    z.object({
      deletedCount: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const foundGames = await ctx.prisma.game.findMany({
      where: {
        id: {
          in: input.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (foundGames.length !== input.id?.length) {
      const missingIds = difference(
        input.id,
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
          in: input.id,
        },
      },
    });

    return {
      deletedCount: count,
    };
  });
