import { z } from "zod";
import {
  booleanEnum,
  commaSeparatedStringToArray,
  untaggedFilterEnum,
} from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";
import { getAllWhereInput } from "./getAll";

const input = z
  .object({
    idFilter: commaSeparatedStringToArray
      .describe("Comma-separated Game Object IDs to filter by")
      .optional(),
    allowFuzzyIdFilter: booleanEnum
      .describe(
        "Set to `true` to enable fuzzy ID filtering. If false, only returns exact matches."
      )
      .default(false),
    nameFilter: commaSeparatedStringToArray
      .describe("Comma-separated Game Object names to filter by")
      .optional(),
    allowFuzzyNameFilter: booleanEnum
      .describe(
        "Set to `true` to disable fuzzy name filtering. If false, only returns exact matches."
      )
      .default(false),
    tagFilter: commaSeparatedStringToArray
      .describe(
        "Comma-separated list of tag IDs the resulting game objects must have"
      )
      .optional(),
    tagExcludeFilter: commaSeparatedStringToArray
      .describe(
        "Comma-separated list of tag IDs to exclude from the response. Use this to exclude game objects that have a specific tag, even if they match the `requiredTags` filter."
      )
      .optional(),
    untaggedFilter: untaggedFilterEnum
      .default("include")
      .describe(
        "`include`: Include all game objects, regardless of whether they have tags or not. \n\n`exclude`: Exclude game objects that have no tags. \n\n`untagged-only`: Only return game objects that have no tags. Setting this option will ignore `requiredTags` and `excludeTags`, since tagged items shouldn't appear in the results."
      ),
    excludeGameObjects: commaSeparatedStringToArray
      .describe(
        "Comma-separated list of Game Object IDs to exclude from the response"
      )
      .optional(),
  })
  .optional();

const output = z.object({
  count: z.number().min(0),
});

export const getCount = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get Game Object Count",
      description: "Get the total Game Object count. Supports filtering.",
      tags: [OPENAPI_TAGS.GAME_OBJECTS],
      method: "GET",
      path: "/game-objects/count",
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
      excludeGameObjects: input?.excludeGameObjects,
      allowFuzzyIdFilter: input?.allowFuzzyIdFilter,
      allowFuzzyNameFilter: input?.allowFuzzyNameFilter,
      tagFilter: input?.tagFilter,
      tagExcludeFilter: input?.tagExcludeFilter,
    });

    const count = await ctx.prisma.gameObject.count({
      where,
    });
    return { count };
  });
