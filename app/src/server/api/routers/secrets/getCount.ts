import { z } from "zod";
import { textFilter } from "../../../shared/z";
import { publicProcedure } from "../../trpc";

export const getCount = publicProcedure
  .input(
    z
      .object({
        filter: z
          .object({
            mode: z.enum(["AND", "OR"]).optional(),
            id: textFilter.optional(),
            name: textFilter.optional(),
          })
          .optional(),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const count = await ctx.prisma.secret.count({
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
    });
    return { count };
  });
