import { TRPCError } from "@trpc/server";
import { difference } from "lodash";
import { z } from "zod";
import { commaSeparatedStringToArray } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: commaSeparatedStringToArray.describe("Comma separated list of tag IDs"),
});

const output = z.object({
  deletedCount: z.number(),
});

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
  .input(input)
  .output(output)
  .mutation(async ({ ctx, input }) => {
    const foundTags = await ctx.prisma.tag.findMany({
      where: {
        id: {
          in: input.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (foundTags.length !== input.id?.length) {
      const missingIds = difference(
        input.id,
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
          in: input.id,
        },
      },
    });

    return {
      deletedCount: count,
    };
  });
