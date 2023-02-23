import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getAll = publicProcedure.input(z.null()).query(async ({ ctx }) => {
  const weights = await ctx.prisma.weight.findMany({
    orderBy: {
      weight: "asc",
    },
  });
  return { weights };
});
