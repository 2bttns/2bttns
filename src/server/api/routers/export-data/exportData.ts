import { z } from "zod";
import { booleanEnum } from "../../../shared/z";
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
    const { includeGames, includeTags, includeGameObjects, includeCount } =
      input;

    const games = includeGames
      ? await ctx.prisma.game.findMany({
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
        })
      : undefined;

    const gameObjects = includeGameObjects
      ? await ctx.prisma.gameObject.findMany({
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
        })
      : undefined;

    const tags = includeTags
      ? await ctx.prisma.tag.findMany({
          select: {
            id: true,
            name: true,
            description: true,
          },
        })
      : undefined;

    const processedOutput: z.infer<typeof output> = {
      count: includeCount
        ? {
            games: games?.length,
            gameObjects: gameObjects?.length,
            tags: tags?.length,
          }
        : undefined,
      games: games?.map((game) => ({
        id: game.id,
        name: game.name,
        description: game.description ?? "",
        inputTagIds: includeTags
          ? game.inputTags.map((tag) => tag.id)
          : undefined,
      })),
      gameObjects: gameObjects?.map((gameObject) => ({
        id: gameObject.id,
        name: gameObject.name,
        description: gameObject.description ?? "",
        tagIds: includeTags ? gameObject.tags.map((tag) => tag.id) : undefined,
      })),
      tags: tags?.map((tag) => ({
        id: tag.id,
        name: tag.name,
        description: tag.description ?? "",
      })),
    };

    return processedOutput;
  });
