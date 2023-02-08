import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getAll = publicProcedure
  .input(
    z
      .object({
        take: z.number().optional().default(10),
        skip: z.number().optional(),
        filter: z
          .object({
            id: z.array(z.string()).optional(),
            name: z.array(z.string()).optional(),
            tag: z.array(z.string()).optional(),
          })
          .optional(),
        includeTags: z.boolean().optional().default(false),
      })
      .optional()
  )
  .query(async ({ ctx, input }) => {
    const gameObjects = await ctx.prisma.gameObject.findMany({
      take: input?.take,
      skip: input?.skip,
      where: {
        id: input?.filter?.id && {
          in: input?.filter?.id,
        },
        name: input?.filter?.name && {
          in: input?.filter?.name,
        },
        tags: input?.filter?.tag && {
          some: {
            id: {
              in: input?.filter?.tag,
            },
          },
        },
      },
      include: {
        tags: input?.includeTags,
      },
    });
    return { gameObjects };
  });
