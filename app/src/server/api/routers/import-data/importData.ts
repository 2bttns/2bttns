import { createId } from "@paralleldrive/cuid2";
import { Game, GameObject, Prisma, Tag } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { output, z } from "zod";
import { defaultMode } from "../../../../modes/availableModes";
import { booleanEnum } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";
import { output as exportDataOutput } from "../export-data/exportData";

const input = z.object({
  jsonBase64: z.string().describe("Base64 encoded JSON file to import"),
  allOrNothing: booleanEnum
    .default(false)
    .describe(
      "If true, the import will fail if any part of it fails. \n\nIf false, the import will continue even if some parts fail."
    ),
  generateNewIds: booleanEnum
    .default(false)
    .describe(
      "Generate new IDs for imported data and remap all references to them, instead of using existing IDs. \n\nThis may result in duplicate entries with similar content but different IDs."
    ),
});

const resultCounts = z.object({
  successes: z.number(),
  failures: z.number(),
});

const output = z.object({
  results: z.object({
    tags: resultCounts,
    gameObjects: resultCounts,
    games: resultCounts,
  }),
  allOrNothingFailed: z.boolean().optional(),
  logMessages: z
    .array(
      z.object({
        type: z.enum(["info", "error"]),
        message: z.string(),
      })
    )
    .optional(),
});

export const importData = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Import Data",
      description: "Import 2bttns data from a JSON file.",
      tags: [OPENAPI_TAGS.IMPORT_DATA],
      method: "POST",
      path: "/import-data",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .mutation(async ({ input, ctx }) => {
    const { jsonBase64, allOrNothing, generateNewIds } = input;

    try {
      const buffer = Buffer.from(jsonBase64, "base64");
      const jsonStr = buffer.toString("utf-8");
      const json = JSON.parse(jsonStr);
      const validated = exportDataOutput.parse(json);

      const importTimestamp = new Date();

      const remappings: {
        tags: { [id: string]: string };
        gameObjects: { [id: string]: string };
        games: { [id: string]: string };
      } = {
        tags: {},
        gameObjects: {},
        games: {},
      };

      validated.tags?.forEach((tag) => {
        if (generateNewIds || !tag.id) {
          const newId = createId();
          if (!tag.id) tag.id = newId;
          remappings.tags[tag.id] = newId;
        }
      });
      validated.gameObjects?.forEach((gameObject) => {
        if (generateNewIds || !gameObject.id) {
          const newId = createId();
          if (!gameObject.id) gameObject.id = newId;
          remappings.gameObjects[gameObject.id] = newId;
        }
      });
      validated.games?.forEach((game) => {
        if (generateNewIds || !game.id) {
          const newId = createId();
          if (!game.id) game.id = newId;
          remappings.games[game.id] = newId;
        }
      });

      const logMessages: z.infer<typeof output>["logMessages"] = [];

      type QueryWithLogMessages = {
        failMessage?: string;
        successMessage?: string;
      } & {
        query:
          | Prisma.Prisma__TagClient<Tag, never>
          | Prisma.Prisma__GameObjectClient<GameObject, never>
          | Prisma.Prisma__GameClient<Game, never>;
      };

      const transactionQueries: QueryWithLogMessages[] = [];

      // Create tags
      let createTagQueries: QueryWithLogMessages[] | undefined;
      if (validated.tags && validated.tags.length > 0) {
        createTagQueries = validated.tags?.map((tag, index) => {
          const tagNumStr = `(Tag ${index + 1}/${validated.tags!.length})`;
          return {
            query: ctx.prisma.tag.create({
              data: {
                id: remappings.tags[tag.id!] ?? tag.id,
                name: `${
                  tag.name
                } (Imported ${importTimestamp.toLocaleString()})`,
              },
            }),
            failMessage: `Failed to create Tag (id="${tag.id}" name="${tag.name}") ${tagNumStr}`,
            successMessage: `Created Tag (id="${tag.id}" name="${tag.name}") ${tagNumStr}`,
          };
        });
        transactionQueries.push(...createTagQueries);
      }

      // Create game objects
      let createGameObjectQueries: QueryWithLogMessages[] | undefined;
      let applyTagsToGameObjectsQueries: QueryWithLogMessages[] | undefined;
      if (validated.gameObjects && validated.gameObjects.length > 0) {
        createGameObjectQueries = validated.gameObjects.map(
          (gameObject, index) => {
            const gameObjectNumStr = `(Game Object ${index + 1}/${
              validated.gameObjects!.length
            })`;
            return {
              query: ctx.prisma.gameObject.create({
                data: {
                  id: remappings.gameObjects[gameObject.id!] ?? gameObject.id,
                  name: gameObject.name ?? "Untitled Game Object",
                  description: gameObject.description,
                },
              }),
              failMessage: `Failed to create Game Object (id="${gameObject.id}" name="${gameObject.name}") ${gameObjectNumStr}`,
              successMessage: `Created Game Object (id="${gameObject.id}" name="${gameObject.name}") ${gameObjectNumStr}`,
            };
          }
        );
        transactionQueries.push(...createGameObjectQueries);

        // Apply imported tags to corresponding game objects
        if (validated.tags && validated.tags.length > 0) {
          applyTagsToGameObjectsQueries = validated.gameObjects.map(
            (gameObject, index) => {
              const gameObjectNumStr = `(Game Object ${index + 1}/${
                validated.gameObjects!.length
              })`;

              const tagsToApply = gameObject.tagIds?.map((id) => ({
                id: remappings.tags[id] ?? id,
              }));

              const tagsToApplyStr = tagsToApply
                ?.map((tag) => `id="${tag.id ?? "undefined"}"`)
                .join(", ");

              return {
                query: ctx.prisma.gameObject.update({
                  where: {
                    id: remappings.gameObjects[gameObject.id!] ?? gameObject.id,
                  },
                  data: {
                    tags: {
                      connect: tagsToApply,
                    },
                  },
                }),
                failMessage: `Failed to apply Tag(s) (${
                  tagsToApplyStr ?? "[]"
                }) to Game Object (id="${gameObject.id}" name="${
                  gameObject.name
                }") ${gameObjectNumStr}`,
                successMessage: `Applied Tag(s) (${
                  tagsToApplyStr ?? "[]"
                }) to Game Object (id="${gameObject.id}" name="${
                  gameObject.name
                }") ${gameObjectNumStr}`,
              };
            }
          );
          transactionQueries.push(...applyTagsToGameObjectsQueries);
        }
      }

      // Create games
      let createGameQueries: QueryWithLogMessages[] | undefined;
      let applyTagsToGamesQueries: QueryWithLogMessages[] | undefined;
      if (validated.games && validated.games.length > 0) {
        createGameQueries = validated.games?.map((game, index) => {
          const gameIndexStr = `(Game ${index + 1}/${validated.games!.length})`;

          return {
            query: ctx.prisma.game.create({
              data: {
                id: remappings.games[game.id!] ?? game.id,
                name: game.name ?? "Untitled Game",
                description: game.description,
                mode: defaultMode,
              },
            }),
            failMessage: `Failed to create Game (id="${game.id}" name="${game.name}") ${gameIndexStr}`,
            successMessage: `Created Game (id="${game.id}" name="${game.name}") ${gameIndexStr}`,
          };
        });
        transactionQueries.push(...createGameQueries);

        // Apply imported input tags to corresponding games
        if (validated.tags && validated.tags.length > 0) {
          applyTagsToGamesQueries = validated.games?.map((game) => {
            const tagsToApply = game.inputTagIds?.map((id) => ({
              id: remappings.tags[id] ?? id,
            }));

            const tagsToApplyStr = tagsToApply
              ?.map((tag) => `id="${tag.id ?? "undefined"}"`)
              .join(", ");

            return {
              query: ctx.prisma.game.update({
                where: {
                  id: remappings.games[game.id!] ?? game.id,
                },
                data: {
                  inputTags: {
                    connect: tagsToApply,
                  },
                },
              }),
              failMessage: `Failed to apply input Tag(s) (${
                tagsToApplyStr ?? "[]"
              }) to Game (id="${game.id}" name="${game.name}")`,
              successMessage: `Applied input Tag(s) (${
                tagsToApplyStr ?? "[]"
              }) to Game (id="${game.id}" name="${game.name}")`,
            };
          });
          transactionQueries.push(...applyTagsToGamesQueries);
        }
      }

      // Execute the queries
      let allOrNothingFailed = undefined;
      if (allOrNothing) {
        // If allOrNothing=true, execute all queries in a transaction
        try {
          await ctx.prisma.$transaction(transactionQueries.map((q) => q.query));
          transactionQueries.forEach((q) => {
            if (q.successMessage) {
              logMessages.push({ type: "info", message: q.successMessage });
            }
          });
          allOrNothingFailed = false;
        } catch (e) {
          allOrNothingFailed = true;
          logMessages.push({
            type: "error",
            message:
              "All or Nothing Import Failed -- no changes have been applied. See below for details.",
          });
          if (e instanceof PrismaClientKnownRequestError) {
            logMessages.push({ type: "error", message: String(e.stack) });
            logMessages.push({
              type: "error",
              message:
                "This indicates the error may have been caused by an imported ID that conflicts with an existing ID.",
            });
          }
        }
      } else {
        // Execute all queries, but continue even if there are errors for allOrNothing=false
        const handleLogs = (q: QueryWithLogMessages) => {
          if (!q) return null;
          return q.query
            .then(() => {
              if (q.successMessage) {
                logMessages.push({ type: "info", message: q.successMessage });
              }
            })
            .catch((e) => {
              if (q.failMessage) {
                let message = q.failMessage;
                if (e instanceof Error) {
                  message += `: ${e.message}`;
                }
                logMessages.push({ type: "error", message });
              }
            });
        };

        if (createTagQueries)
          await Promise.all(createTagQueries.map(handleLogs));
        if (createGameObjectQueries)
          await Promise.all(createGameObjectQueries.map(handleLogs));
        if (createGameQueries)
          await Promise.all(createGameQueries.map(handleLogs));
        if (applyTagsToGameObjectsQueries)
          await Promise.all(applyTagsToGameObjectsQueries.map(handleLogs));
        if (applyTagsToGamesQueries)
          await Promise.all(applyTagsToGamesQueries.map(handleLogs));
      }

      const importedTags = await ctx.prisma.tag.findMany({
        where: {
          id: {
            in: validated.tags?.map(
              (tag) => remappings.tags[tag.id!]! ?? tag.id!
            ),
          },
          createdAt: {
            gte: importTimestamp,
          },
        },
      });

      const importedGameObjects = await ctx.prisma.gameObject.findMany({
        where: {
          id: {
            in: validated.gameObjects?.map(
              (gameObject) =>
                remappings.gameObjects[gameObject.id!]! ?? gameObject.id!
            ),
          },
          createdAt: {
            gte: importTimestamp,
          },
        },
      });

      const importedGames = await ctx.prisma.game.findMany({
        where: {
          id: {
            in: validated.games?.map(
              (game) => remappings.games[game.id!]! ?? game.id!
            ),
          },
          createdAt: {
            gte: importTimestamp,
          },
        },
      });

      const results: z.infer<typeof output>["results"] = {
        tags: {
          successes: importedTags.length,
          failures: validated.tags
            ? validated.tags.length - importedTags.length
            : 0,
        },
        gameObjects: {
          successes: importedGameObjects.length,
          failures: validated.gameObjects
            ? validated.gameObjects.length - importedGameObjects.length
            : 0,
        },
        games: {
          successes: importedGames.length,
          failures: validated.games
            ? validated.games.length - importedGames.length
            : 0,
        },
      };

      return {
        results,
        allOrNothingFailed,
        logMessages,
      };
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: (error as Error).message,
      });
    }
  });
