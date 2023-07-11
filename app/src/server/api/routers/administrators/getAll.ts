import { Prisma } from "@prisma/client";
import { z } from "zod";
import { paginationSkip, paginationTake, sortOrder } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";
import { booleanEnum, commaSeparatedStringToArray } from "./../../../shared/z";

const input = z.object({
  take: paginationTake,
  skip: paginationSkip,
  idFilter: commaSeparatedStringToArray
    .describe("Comma-separated ids to filter by")
    .optional(),
  allowFuzzyIdFilter: booleanEnum
    .describe(
      "Set to `true` to enable fuzzy id filtering. If false, only returns exact matches."
    )
    .default(false),
  sortField: z
    .enum(["id", "displayName", "updatedAt", "createdAt"])
    .describe("Field to sort by")
    .optional(),
  sortOrder,
});

const output = z.object({
  administrators: z.array(
    z.object({
      id: z.string(),
      displayName: z.string().optional(),
      createdAt: z.string().describe("ISO date string"),
      updatedAt: z.string().describe("ISO date string"),
    })
  ),
});

export const getAll = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Get All Admins",
      description: "Get all administrators",
      tags: [OPENAPI_TAGS.ADMINISTRATORS],
      method: "GET",
      path: "/administrators",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .query(async ({ input, ctx }) => {
    const { skip, take, idFilter, allowFuzzyIdFilter, sortField, sortOrder } =
      input;

    const where = getAllWhereInput({ idFilter, allowFuzzyIdFilter });

    const orderBy: Prisma.AdminUserOrderByWithAggregationInput = {
      id: sortField === "id" ? sortOrder : undefined,
      displayName: sortField === "displayName" ? sortOrder : undefined,
      createdAt: sortField === "createdAt" ? sortOrder : undefined,
      updatedAt: sortField === "updatedAt" ? sortOrder : undefined,
    };

    const admins = await ctx.prisma.adminUser.findMany({
      take,
      skip,
      where,
      orderBy,
    });

    const processed: z.infer<typeof output> = {
      administrators: admins.map((admin) => ({
        id: admin.id,
        displayName: admin.displayName ?? undefined,
        createdAt: admin.createdAt.toISOString(),
        updatedAt: admin.createdAt.toISOString(),
      })),
    };

    return processed;
  });

export type GetAllWhereInputParams = {
  idFilter: z.infer<typeof input>["idFilter"];
  allowFuzzyIdFilter: z.infer<typeof input>["allowFuzzyIdFilter"];
};

export function getAllWhereInput(params: GetAllWhereInputParams) {
  const { idFilter, allowFuzzyIdFilter } = params;

  const mode: Prisma.QueryMode = allowFuzzyIdFilter ? "insensitive" : "default";
  const where: Prisma.AdminUserWhereInput = idFilter
    ? {
        // Match any of the emails in the filter
        // If fuzzy matching is enabled, returns any emails that contain the filter. Otherwise, only returns exact matches.
        OR: allowFuzzyIdFilter
          ? idFilter.map((id) => ({
              id: {
                contains: id,
                mode,
              },
            }))
          : idFilter.map((id) => ({
              id: {
                equals: id,
                mode,
              },
            })),
      }
    : {};
  return where;
}
