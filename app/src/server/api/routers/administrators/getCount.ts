import { z } from "zod";
import { booleanEnum, commaSeparatedStringToArray } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";
import { getAllWhereInput } from "./getAll";

const input = z.object({
  emailFilter: commaSeparatedStringToArray
    .describe("Comma-separated emails to filter by")
    .optional(),
  allowFuzzyEmailFilter: booleanEnum
    .describe(
      "Set to `true` to enable fuzzy email filtering. If false, only returns exact matches."
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
    const { emailFilter, allowFuzzyEmailFilter } = input;
    const where = getAllWhereInput(emailFilter, allowFuzzyEmailFilter);
    const count = await ctx.prisma.allowedAdmin.count({
      where,
    });
    const processed: z.infer<typeof output> = {
      count,
    };
    return processed;
  });
