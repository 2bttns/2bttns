import { TRPCError } from "@trpc/server";
import { difference } from "lodash";
import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const deleteTags = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Delete Tags",
      description: "Delete one or more Tags by their IDs",
      tags: [OPENAPI_TAGS.TAGS],
      method: "DELETE",
      path: "/tags",
      protect: true,
    },
  })
  .input(
    z.object({
      id: z.string().describe("Comma separated list of tag IDs"),
    })
  )
  .output(
    z.object({
      deletedCount: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const ids = input.id.split(",");

    const foundTags = await ctx.prisma.tag.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
      },
    });

    if (foundTags.length !== ids.length) {
      const missingIds = difference(
        ids,
        foundTags.map((tag) => tag.id)
      ).join(",");

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `One or more tags not found: ${missingIds}`,
      });
    }

    const { count } = await ctx.prisma.tag.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return {
      deletedCount: count,
    };
  });
