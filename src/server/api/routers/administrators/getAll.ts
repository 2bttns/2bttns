import { Prisma } from "@prisma/client";
import { z } from "zod";
import { paginationSkip, paginationTake, sortOrder } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";
import { booleanEnum, commaSeparatedStringToArray } from "./../../../shared/z";

const input = z.object({
  take: paginationTake,
  skip: paginationSkip,
  emailFilter: commaSeparatedStringToArray
    .describe("Comma-separated emails to filter by")
    .optional(),
  allowFuzzyEmailFilter: booleanEnum
    .describe(
      "Set to `true` to enable fuzzy email filtering. If false, only returns exact matches."
    )
    .default(false),
  sortField: z
    .enum(["email", "updatedAt", "createdAt"])
    .describe("Field to sort by")
    .optional(),
  sortOrder,
});

const output = z.object({
  administrators: z.array(
    z.object({
      email: z.string(),
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
    const {
      skip,
      take,
      emailFilter,
      allowFuzzyEmailFilter,
      sortField,
      sortOrder,
    } = input;

    const where: Prisma.AllowedAdminWhereInput = getAllWhereInput(
      emailFilter,
      allowFuzzyEmailFilter
    );

    const orderBy: Prisma.AllowedAdminMinOrderByAggregateInput = {
      email: sortField === "email" ? sortOrder : undefined,
      createdAt: sortField === "createdAt" ? sortOrder : undefined,
      updatedAt: sortField === "updatedAt" ? sortOrder : undefined,
    };

    const admins = await ctx.prisma.allowedAdmin.findMany({
      take,
      skip,
      where,
      orderBy,
    });

    const processed: z.infer<typeof output> = {
      administrators: admins.map((admin) => ({
        email: admin.email,
        createdAt: (admin.createdAt as Date).toISOString(),
        updatedAt: (admin.createdAt as Date).toISOString(),
      })),
    };

    return processed;
  });

export function getAllWhereInput(
  emailFilter: z.infer<typeof input>["emailFilter"],
  allowFuzzyEmailFilter: z.infer<typeof input>["allowFuzzyEmailFilter"]
) {
  const mode: Prisma.QueryMode = "insensitive";
  const where: Prisma.AllowedAdminWhereInput = emailFilter
    ? {
        // Match any of the emails in the filter
        // If fuzzy matching is enabled, returns any emails that contain the filter. Otherwise, only returns exact matches.
        OR: allowFuzzyEmailFilter
          ? emailFilter.map((email) => ({
              email: {
                contains: email,
                mode,
              },
            }))
          : emailFilter.map((email) => ({
              email: {
                equals: email,
                mode,
              },
            })),
      }
    : {};
  return where;
}
