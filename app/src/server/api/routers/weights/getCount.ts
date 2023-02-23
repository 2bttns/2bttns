import { publicProcedure } from "../../trpc";

export const getCount = publicProcedure.query(async ({ ctx }) => {
  const count = await ctx.prisma.weight.count();
  return { count };
});
