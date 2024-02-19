import { Prisma } from "@prisma/client";
import { z } from "zod";
import { booleanEnum, idSchema } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";

const input = z.object({
  id: idSchema,
  includeGameObjects: booleanEnum.optional().default(false),
});

const output = z.object({
  game: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string().describe("ISO date string"),
    updatedAt: z.string().describe("ISO date string"),
    inputTags: z
      .array(
        z.object({
          id: z.string(),
          createdAt: z.string().describe("ISO date string"),
          updatedAt: z.string().describe("ISO date string"),
          name: z.string(),
          description: z.string().nullable(),
        })
      )
      .describe("Input Tag IDs"),
    mode: z.string(),
    gameObjects: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().nullable(),
          createdAt: z.string().describe("ISO date string"),
          updatedAt: z.string().describe("ISO date string"),
        })
      )
      .optional(),
  }),
});

export const getById = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get Game by ID",
      description: "Get a game by its ID",
      tags: [OPENAPI_TAGS.GAMES],
      method: "GET",
      path: "/games/{id}",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .query(async ({ ctx, input }) => {
    console.log("INCLUED GO: ", input.includeGameObjects);

    const game = await ctx.prisma.game.findFirst({
      where: {
        id: input.id,
      },
      include: {
        inputTags: {
          include: {
            gameObjects: input.includeGameObjects,
          },
        },
      },
    });

    console.log(game);

    if (!game) {
      throw new Error(`Game with id ${input.id} not found`);
    }
    const outputGame: z.infer<typeof output> = {
      game: {
        createdAt: game.createdAt.toISOString(),
        updatedAt: game.updatedAt.toISOString(),
        description: game.description,
        id: game.id,
        inputTags: game.inputTags.map((tag) => ({
          createdAt: tag.createdAt.toISOString(),
          description: tag.description,
          id: tag.id,
          name: tag.name,
          updatedAt: tag.updatedAt.toISOString(),
        })),
        mode: game.mode,
        name: game.name,
        gameObjects: input.includeGameObjects
          ? game.inputTags
              .flatMap((tag) => tag.gameObjects)
              .map((go) => ({
                createdAt: go.createdAt.toISOString(),
                updatedAt: go.updatedAt.toISOString(),
                description: go.description,
                id: go.id,
                name: go.name,
              }))
          : undefined,
      },
    };

    return outputGame;
  });
