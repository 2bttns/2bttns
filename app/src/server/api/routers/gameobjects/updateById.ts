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
    tags: z.array(z.string()).optional(),
  }),
});

const output = z.object({
  updatedGameObject: z.object({
    id: idSchema,
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string().describe("ISO date string"),
    updatedAt: z.string().describe("ISO date string"),
  }),
});

export const updateById = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Update Game Object by ID",
      description: "Update a Game Object by its ID",
      tags: [OPENAPI_TAGS.GAME_OBJECTS],
      method: "PUT",
      path: "/game-objects/{id}",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .mutation(async ({ ctx, input }) => {
    const updatedGameObject = await ctx.prisma.gameObject.update({
      where: {
        id: input.id,
      },
      data: {
        id: input.data.id,
        name: input.data.name,
        description: input.data.description,
        updatedAt: new Date(), // Explicit update of updatedAt; otherwise tags.set won't trigger the default updatedAt update
        tags: {
          set: input.data.tags?.map((tag) => ({ id: tag })),
        },
      },
    });

    return {
      updatedGameObject: {
        ...updatedGameObject,
        createdAt: updatedGameObject.createdAt.toISOString(),
        updatedAt: updatedGameObject.updatedAt.toISOString(),
      },
    };
  });
