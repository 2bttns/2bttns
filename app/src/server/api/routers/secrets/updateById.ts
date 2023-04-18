import { z } from "zod";
import generateSecret from "../../../../utils/generateSecret";
import { anyAuthProtectedProcedure } from "../../trpc";

export const updateById = anyAuthProtectedProcedure
  .input(
    z.object({
      id: z.string(),
      data: z
        .object({
          id: z.string().optional(),
          name: z.string().optional(),
          description: z.string().optional(),
        })
        .optional(),
      generateNewSecret: z.boolean().optional().default(false),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const updatedSecret = await ctx.prisma.secret.update({
      where: {
        id: input.id,
      },
      data: {
        id: input.data?.id,
        name: input.data?.name,
        description: input.data?.description,
        secret: input.generateNewSecret ? generateSecret() : undefined,
      },
    });

    return {
      updatedSecret,
    };
  });
