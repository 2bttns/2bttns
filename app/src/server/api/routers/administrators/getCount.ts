import { z } from "zod";
import { booleanEnum, commaSeparatedStringToArray } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";
import { getAllWhereInput } from "./getAll";

const input = z.object({
  idFilter: commaSeparatedStringToArray
    .describe("Comma-separated ids to filter by")
    .optional(),
  allowFuzzyIdFilter: booleanEnum
    .describe(
      "Set to `true` to enable fuzzy id filtering. If false, only returns exact matches."
    )
    .default(false),
});

const output = z.object({
  count: z.number(),
});

export const getCount = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get Admin Count",
      description:
        "Get the total number of administrators. Useful for pagination.",
      tags: [OPENAPI_TAGS.ADMINISTRATORS],
      method: "GET",
      path: "/administrators/count",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .query(async ({ input, ctx }) => {
    const { idFilter, allowFuzzyIdFilter } = input;
    const where = getAllWhereInput({ idFilter, allowFuzzyIdFilter });
    const count = await ctx.prisma.adminUser.count({
      where,
    });
    const processed: z.infer<typeof output> = {
      count,
    };
    return processed;
  });
