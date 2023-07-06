import { TRPCError } from "@trpc/server";
import { difference } from "lodash";
import { z } from "zod";
import { commaSeparatedStringToArray } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: commaSeparatedStringToArray.describe(
    "Comma separated list of game object IDs"
  ),
});

const output = z.object({
  deletedCount: z.number(),
});

export const deleteGameObjects = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Delete Game Objects",
      description: "Delete one or more game objects by their IDs",
      tags: [OPENAPI_TAGS.GAME_OBJECTS],
      method: "DELETE",
      path: "/game-objects",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .mutation(async ({ ctx, input }) => {
    const foundGameObjects = await ctx.prisma.gameObject.findMany({
      where: {
        id: {
          in: input.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (foundGameObjects.length !== input.id?.length) {
      const missingIds = difference(
        input.id,
        foundGameObjects.map((gameObject) => gameObject.id)
      ).join(",");

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `One or more game objects not found: ${missingIds}`,
      });
    }

    const { count } = await ctx.prisma.gameObject.deleteMany({
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
