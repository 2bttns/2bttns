import { z } from "zod";
import generateSecret from "../../../../utils/generateSecret";
import { anyAuthProtectedProcedure } from "../../trpc";

export const create = anyAuthProtectedProcedure
  .input(
    z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const createdSecret = await ctx.prisma.secret.create({
      data: {
        id: input.id,
        name: input.name,
        description: input.description,
        secret: generateSecret(),
      },
    });

    return {
      createdSecret,
    };
  });
