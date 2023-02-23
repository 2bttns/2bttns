import { publicProcedure } from "../../trpc";

export const getAll = publicProcedure.query(async ({ ctx }) => {
  const weights = await ctx.prisma.weight.findMany({
    orderBy: {
      weight: "asc",
    },
  });
  return { weights };
});
