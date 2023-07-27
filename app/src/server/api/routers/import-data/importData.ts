import { createId } from "@paralleldrive/cuid2";
import { Game, GameObject, Prisma, PrismaPromise } from "@prisma/client";
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
  errorMessages: z.array(z.string()).optional(),
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

      const remappedIdsOldToNew: {
        tags: { [id: string]: string };
        gameObjects: { [id: string]: string };
        games: { [id: string]: string };
      } = {
        tags: {},
        gameObjects: {},
        games: {},
      };

      const remappedIdsNewToOld: typeof remappedIdsOldToNew = {
        tags: {},
        gameObjects: {},
        games: {},
      };

      const transactionQueries: (
        | PrismaPromise<Prisma.BatchPayload>
        | Prisma.Prisma__GameObjectClient<GameObject, never>
        | Prisma.Prisma__GameClient<Game, never>
      )[] = [];

      // Create tags
      let createTagsQuery: PrismaPromise<Prisma.BatchPayload> | undefined;
      if (validated.tags && validated.tags.length > 0) {
        if (generateNewIds) {
          validated.tags.forEach((tag) => {
            const newId = createId();
            remappedIdsOldToNew.tags[tag.id] = newId;
            remappedIdsNewToOld.tags[newId] = tag.id;
          });
        }

        createTagsQuery = ctx.prisma.tag.createMany({
          data: validated.tags?.map((tag) => ({
            id: generateNewIds ? remappedIdsOldToNew.tags[tag.id] : tag.id,
            name: `${tag.name} (Imported ${importTimestamp.toLocaleString()})`,
          })),
        });
        transactionQueries.push(createTagsQuery);
      }

      // Create game objects
      let createGameObjectsQuery:
        | PrismaPromise<Prisma.BatchPayload>
        | undefined;
      let applyTagsToGameObjectsQueries:
        | Prisma.Prisma__GameObjectClient<GameObject, never>[]
        | undefined;
      if (validated.gameObjects && validated.gameObjects.length > 0) {
        if (generateNewIds) {
          validated.gameObjects.forEach((gameObject) => {
            const newId = createId();
            remappedIdsOldToNew.gameObjects[gameObject.id] = newId;
            remappedIdsNewToOld.gameObjects[newId] = gameObject.id;
          });
        }

        createGameObjectsQuery = ctx.prisma.gameObject.createMany({
          data: validated.gameObjects?.map((gameObject) => ({
            id: generateNewIds
              ? remappedIdsOldToNew.gameObjects[gameObject.id]
              : gameObject.id,
            name: gameObject.name,
            description: gameObject.description,
          })),
        });
        transactionQueries.push(createGameObjectsQuery);

        // Apply imported tags to corresponding game objects
        if (validated.tags && validated.tags.length > 0) {
          applyTagsToGameObjectsQueries = validated.gameObjects.map(
            (gameObject) => {
              return ctx.prisma.gameObject.update({
                where: {
                  id: generateNewIds
                    ? remappedIdsOldToNew.gameObjects[gameObject.id]
                    : gameObject.id,
                },
                data: {
                  tags: {
                    connect: gameObject.tagIds?.map((id) => ({
                      id: generateNewIds ? remappedIdsOldToNew.tags[id] : id,
                    })),
                  },
                },
              });
            }
          );
          transactionQueries.push(...applyTagsToGameObjectsQueries);
        }
      }

      // Create games
      let createGamesQuery: PrismaPromise<Prisma.BatchPayload> | undefined;
      let applyTagsToGamesQueries:
        | Prisma.Prisma__GameClient<Game, never>[]
        | undefined;
      if (validated.games && validated.games.length > 0) {
        if (generateNewIds) {
          validated.games.forEach((game) => {
            const newId = createId();
            remappedIdsOldToNew.games[game.id] = newId;
            remappedIdsNewToOld.games[newId] = game.id;
          });
        }

        // Create games
        createGamesQuery = ctx.prisma.game.createMany({
          data: validated.games?.map((game) => ({
            id: generateNewIds ? remappedIdsOldToNew.games[game.id] : game.id,
            name: game.name,
            description: game.description,
            mode: defaultMode,
          })),
        });
        transactionQueries.push(createGamesQuery);

        // Apply imported input tags to corresponding games
        if (validated.tags && validated.tags.length > 0) {
          applyTagsToGamesQueries = validated.games?.map((game) => {
            return ctx.prisma.game.update({
              where: {
                id: generateNewIds
                  ? remappedIdsOldToNew.games[game.id]
                  : game.id,
              },
              data: {
                inputTags: {
                  connect: game.inputTagIds?.map((id) => ({
                    id: generateNewIds ? remappedIdsOldToNew.tags[id] : id,
                  })),
                },
              },
            });
          });
          transactionQueries.push(...applyTagsToGamesQueries);
        }
      }

      // Execute the queries
      const errorMessages: z.infer<typeof output>["errorMessages"] = [];
      let allOrNothingFailed = undefined;
      if (allOrNothing) {
        // If allOrNothing=true, execute all queries in a transaction
        try {
          await ctx.prisma.$transaction(transactionQueries);
          allOrNothingFailed = false;
        } catch (e) {
          allOrNothingFailed = true;
          if (e instanceof Error) {
            errorMessages.push(e.message);
          }
        }
      } else {
        // Execute all queries, but continue even if there are errors for allOrNothing=false
        const takeErrorMessages = (e: Error) => {
          errorMessages.push(e.message);
        };
        await Promise.all(
          [createTagsQuery].map((q) => q?.catch(takeErrorMessages))
        );
        await Promise.all(
          [createGameObjectsQuery].map((q) => q?.catch(takeErrorMessages))
        );
        await Promise.all(
          [createGamesQuery].map((q) => q?.catch(takeErrorMessages))
        );
        if (applyTagsToGameObjectsQueries)
          await Promise.all(
            applyTagsToGameObjectsQueries.map((q) => q.catch(takeErrorMessages))
          );
        if (applyTagsToGamesQueries)
          await Promise.all(
            applyTagsToGamesQueries.map((q) => q.catch(takeErrorMessages))
          );
      }

      const importedTags = await ctx.prisma.tag.findMany({
        where: {
          id: {
            in: validated.tags?.map((tag) =>
              generateNewIds ? remappedIdsOldToNew.tags[tag.id]! : tag.id
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
            in: validated.gameObjects?.map((gameObject) =>
              generateNewIds
                ? remappedIdsOldToNew.gameObjects[gameObject.id]!
                : gameObject.id
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
            in: validated.games?.map((game) =>
              generateNewIds ? remappedIdsOldToNew.games[game.id]! : game.id
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
        errorMessages,
      };
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: (error as Error).message,
      });
    }
  });
