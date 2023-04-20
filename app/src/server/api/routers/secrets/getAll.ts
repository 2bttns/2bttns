import { z } from "zod";
import { sort, textFilter } from "../../../shared/z";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const getAll = adminOrApiKeyProtectedProcedure
  .input(
    z
      .object({
        take: z.number().optional().default(10),
        skip: z.number().optional(),
        filter: z
          .object({
            mode: z.enum(["AND", "OR"]).optional(),
            id: textFilter.optional(),
            name: textFilter.optional(),
          })
          .optional(),
        sort: z
          .object({
            id: sort.optional(),
            name: sort.optional(),
            description: sort.optional(),
            secret: sort.optional(),
            updatedAt: sort.optional(),
          })
          .optional(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const secrets = await ctx.prisma.secret.findMany({
      take: input?.take,
      skip: input?.skip,
      where: {
        [input?.filter?.mode ?? "AND"]: input?.filter?.mode
          ? [
              {
                id: {
                  in: input?.filter?.id?.in,
                  contains: input?.filter?.id?.contains,
                },
              },
              {
                name: {
                  in: input?.filter?.name?.in,
                  contains: input?.filter?.name?.contains,
                },
              },
            ]
          : undefined,
      },
      orderBy: {
        id: input?.sort?.id,
        name: input?.sort?.name,
        description: input?.sort?.description,
        secret: input?.sort?.secret,
        updatedAt: input?.sort?.updatedAt,
      },
    });
    return { secrets };
  });
