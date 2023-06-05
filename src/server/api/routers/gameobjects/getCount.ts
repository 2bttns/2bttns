import { z } from "zod";
import { commaSeparatedStringToArray } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z
  .object({
    idFilter: commaSeparatedStringToArray
      .optional()
      .describe("Game Object ID to filter by. Can be used with other filters."),
    nameFilter: commaSeparatedStringToArray
      .optional()
      .describe(
        "Game Object name to filter by. Can be used with other filters."
      ),
    requiredTags: commaSeparatedStringToArray
      .optional()
      .describe(
        "Comma-separated list of tag IDs the resulting game objects must have"
      ),
    excludeTags: commaSeparatedStringToArray
      .optional()
      .describe(
        "Comma-separated list of tag IDs to exclude from the response. Use this to exclude game objects that have a specific tag, even if they match the `requiredTags` filter."
      ),
    includeUntagged: z
      .boolean()
      .default(true)
      .describe(
        "Set to `false` to exclude untagged Game Objects from the response"
      ),
    excludeGameObjects: commaSeparatedStringToArray
      .optional()
      .describe(
        "Comma-separated list of Game Object IDs to exclude from the response"
      ),
  })
  .optional();

const output = z.object({
  count: z.number(),
});

export const getCount = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get Game Objects Count",
      description:
        "Get the number of game objects that match the specified filters. This is useful for pagination.",
      tags: [OPENAPI_TAGS.GAME_OBJECTS],
      method: "GET",
      path: "/game-objects/count",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .query(async ({ ctx, input }) => {
    const count = await ctx.prisma.gameObject.count({
      where: {
        AND: [
          {
            OR:
              input?.idFilter || input?.nameFilter
                ? [
                    ...(input?.idFilter?.map((id) => ({
                      id: { contains: id },
                    })) || []),
                    ...(input?.nameFilter?.map((name) => ({
                      name: { contains: name },
                    })) || []),
                  ]
                : undefined,
          },
          {
            id: {
              notIn: input?.excludeGameObjects,
            },
          },
        ],
      },
    });

    return { count };
  });
