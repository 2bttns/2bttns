import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const create = publicProcedure
  .input(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      description: z.string().optional(),
      listItems: z
        .array(
          z.object({
            id: z.string().optional(),
            name: z.string(),
            description: z.string().optional(),
          })
        )
        .optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const createdList = await ctx.prisma.list.create({
      data: {
        id: input.id,
        name: input.name,
        description: input.description,
        ListItem: {
          create: input.listItems,
        },
      },
    });

    return {
      createdGame: createdList,
    };
  });
