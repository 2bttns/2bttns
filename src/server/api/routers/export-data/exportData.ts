import { Game, Tag } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../../db";
import { booleanEnum, commaSeparatedStringToArray } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  includeGames: booleanEnum
    .default(true)
    .describe(
      "Set to true to export Games. \n\nThe Game data will include associated Tag IDs if `includeTags` is `true`"
    ),
  includeGameObjects: booleanEnum
    .default(true)
    .describe(
      "Set to true to export Game Objects. \n\nThe GameObject data will include associated Tag IDs if `includeTags` is `true`"
    ),
  includeTags: booleanEnum
    .default(true)
    .describe("Set to true to export Tags."),
  includeCount: booleanEnum
    .default(true)
    .describe("Set to true to include a count of each type of data exported."),

  filterGameIds: commaSeparatedStringToArray
    .describe(
      "Comma-separated ID list of Games to export.\n\nLeave this field empty if you want the results to include all Games."
    )
    .optional(),
  filterGameObjectIds: commaSeparatedStringToArray
    .describe(
      "Comma-separated ID list of GameObjects to export.\n\nLeave this field empty if you want the results to include all GameObjects."
    )
    .optional(),
  filterAllowUntaggedGameObjects: booleanEnum
    .describe("Set to `false` to exclude GameObjects that have no tags.")
    .default(true),
  filterTagIds: commaSeparatedStringToArray
    .describe(
      "Comma-separated ID list of Tags to export.\n\nLeave this field empty if you want the results to include all Tags."
    )
    .optional(),
  filterTagsMustBeInGames: booleanEnum
    .describe(
      "Set to `true` to only include Tags that are associated with the games that are being exported."
    )
    .default(false),
  // TODO: Export associated game object ids with game objects
  // TODO: Export Weights
  // TODO: Export Modes & necessary config used by exported Games -
  //        - when we add more modes later, when an admin imports a game,
  //          they should be notified they need to install a mode plugin to
  //          play the game if it isn't already installed
});

const output = z.object({
  count: z
    .object({
      games: z.number().optional(),
      gameObjects: z.number().optional(),
      tags: z.number().optional(),
    })
    .optional(),
  games: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        inputTagIds: z.array(z.string()).optional(),
      })
    )
    .optional(),
  gameObjects: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        tagIds: z.array(z.string()).optional(),
      })
    )
    .optional(),
  tags: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
      })
    )
    .optional(),
});

export const exportData = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Export Data",
      description:
        "Get exported 2bttns data. \n\nYou can choose to export all data or only the data you need from the Game, Tag, and Game Object database tables used by 2bttns. \n\nSupports JSON format.",
      tags: [OPENAPI_TAGS.EXPORT_DATA],
      method: "GET",
      path: "/export-data",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .query(async ({ input, ctx }) => {
    const {
      includeGames,
      includeTags,
      includeGameObjects,
      includeCount,
      filterGameIds,
      filterGameObjectIds,
      filterAllowUntaggedGameObjects,
      filterTagIds,
      filterTagsMustBeInGames,
    } = input;

    const games = includeGames
      ? await getGames(includeTags || filterTagsMustBeInGames, filterGameIds)
      : undefined;

    const tags = includeTags ? await getTags(filterTagIds) : undefined;

    const allowedTagsMap = generateTagsMap({
      tagIds: tags?.map((t) => t.id) ?? [],
      filterTagsMustBeInGames,
      games: filterTagsMustBeInGames
        ? games?.map((g) => ({
            id: g.id,
            inputTags: g.inputTags.map((t) => t.id) ?? [],
          }))
        : undefined,
    });
    const filteredTags = tags?.filter((tag) => allowedTagsMap.has(tag.id));

    const gameObjects = includeGameObjects
      ? await getGameObjects({
          includeTags: includeTags,
          filterGameObjectIds: filterGameObjectIds,
          filterTagIds: filterTagsMustBeInGames
            ? filteredTags?.map((t) => t.id)
            : filterTagIds,
          filterAllowUntaggedGameObjects:
            filterAllowUntaggedGameObjects && !filterTagsMustBeInGames,
        })
      : undefined;

    const processedOutput: z.infer<typeof output> = {
      count: includeCount
        ? {
            games: games?.length,
            gameObjects: gameObjects?.length,
            tags: filteredTags?.length,
          }
        : undefined,
      games: games?.map((game) => ({
        id: game.id,
        name: game.name,
        description: game.description ?? "",
        inputTagIds: includeTags
          ? // Input tags for a game should only have tags that are allowed in the current export operation
            game.inputTags
              .map((tag) => tag.id)
              .filter((id) => allowedTagsMap?.has(id))
          : undefined,
      })),
      gameObjects: gameObjects?.map((gameObject) => ({
        id: gameObject.id,
        name: gameObject.name,
        description: gameObject.description ?? "",
        // Tags for a game object should only have tags that are allowed in the current export operation
        tagIds: includeTags
          ? gameObject.tags
              .map((tag) => tag.id)
              .filter((id) => allowedTagsMap?.has(id))
          : undefined,
      })),
      tags: filteredTags?.map((tag) => ({
        id: tag.id,
        name: tag.name,
        description: tag.description ?? "",
      })),
    };

    return processedOutput;
  });
async function getTags(filterTagIds: string[] | undefined) {
  return await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    where: {
      id: {
        in: filterTagIds,
      },
    },
  });
}

async function getGameObjects(params: {
  includeTags: boolean;
  filterGameObjectIds: string[] | undefined;
  filterTagIds: string[] | undefined;
  filterAllowUntaggedGameObjects: boolean;
}) {
  const {
    includeTags,
    filterGameObjectIds,
    filterTagIds,
    filterAllowUntaggedGameObjects,
  } = params;
  return await prisma.gameObject.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      tags: includeTags
        ? {
            select: {
              id: true,
            },
          }
        : undefined,
    },
    where: {
      id: {
        in: filterGameObjectIds,
      },
      OR: [
        {
          tags: {
            some: {
              id: {
                in: filterTagIds,
              },
            },
          },
        },
        filterAllowUntaggedGameObjects
          ? {
              tags: {
                none: {},
              },
            }
          : {},
      ],
    },
  });
}

async function getGames(
  includeTags: boolean,
  filterGameIds: string[] | undefined
) {
  return await prisma.game.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      inputTags: includeTags
        ? {
            select: {
              id: true,
            },
          }
        : undefined,
    },
    where: {
      id: {
        in: filterGameIds,
      },
    },
  });
}

// Map of allowed tag IDs for fast lookups when filtering the tag results of games & game objects
// This way, game and game object tags that aren't in the allowed tags list are filtered out
function generateTagsMap(params: {
  tagIds: Tag["id"][];
  filterTagsMustBeInGames?: boolean;
  games?: { id: Game["id"]; inputTags: Tag["id"][] }[];
}) {
  const { tagIds, filterTagsMustBeInGames = false, games = [] } = params;
  return tagIds.reduce((map, id) => {
    if (filterTagsMustBeInGames) {
      const isTagValid = games.some((game) => game.inputTags.includes(id));
      if (!isTagValid) return map;
    }
    map.set(id, true);
    return map;
  }, new Map<string, boolean>());
}
