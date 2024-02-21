import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
});

const output = z.object({
  tag: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string().describe("ISO date string"),
    updatedAt: z.string().describe("ISO date string"),
  }),
});

export const getById = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get Tag by ID",
      description: "Get a Tag by its ID.",
      tags: [OPENAPI_TAGS.TAGS],
      method: "GET",
      path: "/tags/{id}",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .query(async ({ ctx, input }) => {
    const tag = await ctx.prisma.tag.findFirst({
      where: {
        id: input.id,
      },
    });

    if (!tag) {
      throw new Error(`Tag with id='${input.id}' not found`);
    }

    return {
      tag: {
        id: tag.id,
        name: tag.name,
        description: tag.description,
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(),
      },
    };
  });
