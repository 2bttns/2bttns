import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
});

export const outputGameObject = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().describe("ISO date string"),
  updatedAt: z.string().describe("ISO date string"),
  tags: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .describe("Tag IDs"),
  related: z.array(z.string().describe("Related Game Object IDs")),
});

const output = z.object({
  gameObject: outputGameObject,
});

export const getById = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get Game Object by ID",
      description: "Get a Game Object by its ID.",
      tags: [OPENAPI_TAGS.GAME_OBJECTS],
      method: "GET",
      path: "/game-objects/{id}",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .query(async ({ ctx, input }) => {
    const gameObject = await ctx.prisma.gameObject.findFirst({
      where: {
        id: input.id,
      },
      include: {
        tags: { select: { id: true, name: true } },
        FromGameObjectRelationship: { select: { toGameObjectId: true } },
      },
    });

    if (!gameObject) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Game Object not found",
      });
    }

    return {
      gameObject: {
        ...gameObject,
        createdAt: gameObject.createdAt.toISOString(),
        updatedAt: gameObject.updatedAt.toISOString(),
        tags: gameObject.tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
        })),
        related: gameObject.FromGameObjectRelationship.map(
          ({ toGameObjectId }) => toGameObjectId
        ),
      },
    };
  });
