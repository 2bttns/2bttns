import { TRPCError } from "@trpc/server";
import { difference } from "lodash";
import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

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
  .input(
    z.object({
      id: z.string().describe("Comma separated list of game object IDs"),
    })
  )
  .output(
    z.object({
      deletedCount: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const ids = input.id.split(",");

    const foundGameObjects = await ctx.prisma.gameObject.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
      },
    });

    if (foundGameObjects.length !== ids.length) {
      const missingIds = difference(
        ids,
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
          in: ids,
        },
      },
    });

    return {
      deletedCount: count,
    };
  });
