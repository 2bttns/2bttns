import { z } from "zod";
import { publicProcedure } from "../../trpc";

const filter = z.object({
  in: z.array(z.string()).optional(),
  contains: z.string().optional(),
});

export const getAll = publicProcedure
  .input(
    z
      .object({
        take: z.number().optional().default(10),
        skip: z.number().optional(),
        filter: z
          .object({
            mode: z.enum(["AND", "OR"]).optional(),
            id: filter.optional(),
            name: filter.optional(),
            tag: filter.optional(),
          })
          .optional(),
        includeTags: z.boolean().optional().default(false),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    console.log(input);
    const gameObjects = await ctx.prisma.gameObject.findMany({
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
              {
                tags: {
                  some: {
                    name: {
                      in: input?.filter?.tag?.in,
                      contains: input?.filter?.tag?.contains,
                    },
                  },
                },
              },
            ]
          : undefined,
      },
      include: {
        tags: input?.includeTags,
      },
    });
    return { gameObjects };
  });
