import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const create = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Create example",
      description: "Create an example object in the database",
      tags: [OPENAPI_TAGS.EXAMPLE],
      method: "POST",
      path: "/example/create",
      protect: true,
    },
  })
  .input(
    z
      .object({
        id: z.string().optional(),
      })
      .optional()
  )
  .output(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const examples = await ctx.prisma.example.create({
      data: {
        id: input?.id,
      },
    });
    return { id: examples.id };
  });
