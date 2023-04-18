import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { anyAuthProtectedProcedure } from "../../trpc";

export const getAll = anyAuthProtectedProcedure
  .meta({
    openapi: {
      summary: "Get all examples",
      description: "Get all examples",
      tags: [OPENAPI_TAGS.EXAMPLE],
      method: "GET",
      path: "/example/getAll",
    },
  })
  .input(z.void())
  .output(
    z.object({
      examples: z.array(
        z.object({
          id: z.string(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
      ),
    })
  )
  .query(async ({ ctx }) => {
    const examples = await ctx.prisma.example.findMany();
    return { examples };
  });
