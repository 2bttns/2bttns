import { z } from "zod";
import { paginationSkip, paginationTake, sortOrder } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  take: paginationTake,
  skip: paginationSkip,
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
    const { skip, take, sortField, sortOrder } = input;

    const admins = await ctx.prisma.allowedAdmin.findMany({
      take,
      skip,
      orderBy: {
        email: sortField === "email" ? sortOrder : undefined,
        createdAt: sortField === "createdAt" ? sortOrder : undefined,
        updatedAt: sortField === "updatedAt" ? sortOrder : undefined,
      },
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
