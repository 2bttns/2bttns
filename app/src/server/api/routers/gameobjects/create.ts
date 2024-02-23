import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema.optional(),
  name: z.string(),
  description: z.string().optional(),
  tags: z
    .array(
      z.object({
        id: idSchema.optional(),
      })
    )
    .optional(),
});

const output = z.object({
  createdGameObject: z.object({
    id: idSchema,
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string().describe("ISO date string"),
    updatedAt: z.string().describe("ISO date string"),
  }),
});

export const create = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Create GameObject",
      description: "Create a new GameObject",
      tags: [OPENAPI_TAGS.GAME_OBJECTS],
      method: "POST",
      path: "/game-objects",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .mutation(async ({ input, ctx }) => {
    const createdGameObject = await ctx.prisma.gameObject.create({
      data: {
        id: input.id,
        name: input.name,
        description: input.description,
        tags: {
          connect: input.tags?.map((tag) => ({
            id: tag.id,
          })),
        },
      },
    });

    return {
      createdGameObject: {
        id: createdGameObject.id,
        name: createdGameObject.name,
        description: createdGameObject.description,
        createdAt: createdGameObject.createdAt.toISOString(),
        updatedAt: createdGameObject.updatedAt.toISOString(),
      },
    };
  });
