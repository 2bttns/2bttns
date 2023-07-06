import { z } from "zod";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

export const getAll = adminOrApiKeyProtectedProcedure
  .input(z.null())
  .query(async ({ ctx }) => {
    const weights = await ctx.prisma.weight.findMany({
      orderBy: {
        weight: "asc",
      },
    });
    return { weights };
  });
