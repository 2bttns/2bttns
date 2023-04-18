import { z } from "zod";
import { anyAuthProtectedProcedure } from "../../trpc";

export const getAll = anyAuthProtectedProcedure
  .input(z.null())
  .query(async ({ ctx }) => {
    const weights = await ctx.prisma.weight.findMany({
      orderBy: {
        weight: "asc",
      },
    });
    return { weights };
  });
