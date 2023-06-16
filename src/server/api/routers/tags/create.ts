import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema.optional(),
  name: z.string(),
  description: z.string().optional(),
});

const output = z.object({
  createdTag: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string().describe("ISO date string"),
    updatedAt: z.string().describe("ISO date string"),
  }),
});

export const create = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Create Tag",
      description: "Create Tag",
      tags: [OPENAPI_TAGS.TAGS],
      method: "POST",
      path: "/tags",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .mutation(async ({ input, ctx }) => {
    const createdTag = await ctx.prisma.tag.create({
      data: {
        id: input.id,
        name: input.name,
        description: input.description,
      },
    });

    const processedCreatedTag: (typeof output._type)["createdTag"] = {
      ...createdTag,
      createdAt: createdTag.createdAt.toISOString(),
      updatedAt: createdTag.updatedAt.toISOString(),
    };

    return {
      createdTag: processedCreatedTag,
    };
  });
