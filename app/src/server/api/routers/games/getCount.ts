import { z } from "zod";
import {
  booleanEnum,
  commaSeparatedStringToArray,
  paginationSkip,
  paginationTake,
  untaggedFilterEnum,
} from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";
import { getAllWhereInput } from "./getAll";

const input = z
  .object({
    idFilter: commaSeparatedStringToArray
      .describe("Comma-separated Game IDs to filter by")
      .optional(),
    allowFuzzyIdFilter: booleanEnum
      .describe(
        "Set to `true` to enable fuzzy ID filtering. If false, only returns exact matches."
      )
      .default(false),
    nameFilter: commaSeparatedStringToArray
      .describe("Comma-separated Game names to filter by")
      .optional(),
    allowFuzzyNameFilter: booleanEnum
      .describe(
        "Set to `true` to enable fuzzy name filtering. If false, only returns exact matches."
      )
      .default(false),
    tagFilter: commaSeparatedStringToArray
      .describe(
        "Comma-separated list of input tag IDs the resulting game must have"
      )
      .optional(),
    tagExcludeFilter: commaSeparatedStringToArray
      .describe(
        "Comma-separated list of input tag IDs to exclude from the response. Use this to exclude games that have a specific input tag, even if they match the `requiredTags` filter."
      )
      .optional(),
    untaggedFilter: untaggedFilterEnum
      .default("include")
      .describe(
        "`include`: Include all games, regardless of whether they have input tags or not. \n\n`exclude`: Exclude games that have no input tags. \n\n`untagged-only`: Only return games that have no input tags. Setting this option will ignore `requiredTags` and `excludeTags`, since tagged items shouldn't appear in the results."
      ),
    excludeGames: commaSeparatedStringToArray
      .describe("Comma-separated list of Game IDs to exclude from the response")
      .optional(),
  })
  .optional();

const output = z.object({
  count: z.number(),
});

export const getCount = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get Game Count",
      description: "Get Game Count",
      tags: [OPENAPI_TAGS.GAMES],
      method: "GET",
      path: "/games/count",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .query(async ({ ctx, input }) => {
    const where = getAllWhereInput({
      idFilter: input?.idFilter,
      nameFilter: input?.nameFilter,
      untaggedFilter: input?.untaggedFilter,
      excludeGames: input?.excludeGames,
      allowFuzzyIdFilter: input?.allowFuzzyIdFilter,
      allowFuzzyNameFilter: input?.allowFuzzyNameFilter,
      tagFilter: input?.tagFilter,
      tagExcludeFilter: input?.tagExcludeFilter,
    });

    const count = await ctx.prisma.game.count({
      where,
    });

    return { count };
  });
