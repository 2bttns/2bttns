import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getById = publicProcedure
  .input(
    z.object({
      id: z.string(),
      includeListItems: z.boolean().optional().default(false),
    })
  )
  .query(async ({ ctx, input }) => {
    const list = await ctx.prisma.list.findFirst({
      where: {
        id: input.id,
      },
      include: {
        ListItem: input.includeListItems,
      },
    });

    if (!list) {
      throw new Error(`List with id ${input.id} not found`);
    }

    return { list };
  });
