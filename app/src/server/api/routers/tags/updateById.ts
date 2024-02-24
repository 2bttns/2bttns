import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
  data: z.object({
    id: idSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    addGameObjects: z.array(z.string()).optional(),
    removeGameObjects: z.array(z.string()).optional(),
  }),
});

const output = z.object({
  updatedTag: z.object({
    id: z.string(),
    createdAt: z.string().describe("ISO date string"),
    updatedAt: z.string().describe("ISO date string"),
    name: z.string(),
    description: z.string().nullable(),
    gameObjectCount: z.number(),
  }),
});

export const updateById = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Update Tag by ID",
      description: "Update a Tag by its ID",
      tags: [OPENAPI_TAGS.TAGS],
      method: "PUT",
      path: "/tags/{id}",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .mutation(async ({ ctx, input }) => {
    try {
      const updatedTag = await ctx.prisma.tag.update({
        where: {
          id: input.id,
        },
        data: {
          id: input.data.id,
          name: input.data.name,
          description: input.data.description,
          gameObjects: {
            connect: input.data.addGameObjects
              ? input.data.addGameObjects.map((id) => ({ id }))
              : undefined,
            disconnect: input.data.removeGameObjects
              ? input.data.removeGameObjects.map((id) => ({ id }))
              : undefined,
          },
          updatedAt: new Date(),
        },
      });

      const gameObjectCount = await ctx.prisma.gameObject.count({
        where: {
          tags: {
            some: {
              id: input.id,
            },
          },
        },
      });

      // Update updatedAt timestamp on all gameObjects that were connected or disconnected
      if (input.data.addGameObjects || input.data.removeGameObjects) {
        await ctx.prisma.gameObject.updateMany({
          where: {
            OR: [
              {
                id: {
                  in: input.data.addGameObjects ?? [],
                },
              },
              {
                id: {
                  in: input.data.removeGameObjects ?? [],
                },
              },
            ],
          },
          data: {
            updatedAt: new Date(),
          },
        });
      }

      return {
        updatedTag: {
          ...updatedTag,
          createdAt: updatedTag.createdAt.toISOString(),
          updatedAt: updatedTag.updatedAt.toISOString(),
          gameObjectCount: gameObjectCount ?? 0,
        },
      };
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
