import { TRPCError } from "@trpc/server";
import { output, z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const output = z.object({
  deletedPlayer: z.object({
    id: z.string(),
    name: z.string().nullable().optional(),
    createdAt: z.string().describe("ISO date string"),
    updatedAt: z.string().describe("ISO date string"),
  }),
});

export const deleteById = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Delete Player by ID",
      description: "Delete player by ID",
      tags: [OPENAPI_TAGS.PLAYERS],
      method: "DELETE",
      path: "/players/{id}",
      protect: true,
    },
  })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .output(output)
  .mutation(async ({ input, ctx }) => {
    try {
      const deletedPlayer = await ctx.prisma.player.delete({
        where: {
          id: input.id,
        },
      });
      const processedDeletedPlayer: typeof output._type["deletedPlayer"] = {
        ...deletedPlayer,
        createdAt: deletedPlayer.createdAt.toISOString(),
        updatedAt: deletedPlayer.updatedAt.toISOString(),
      };

      return {
        deletedPlayer: processedDeletedPlayer,
      };
    } catch (error) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Player with id='${input.id}' not found`,
      });
    }
  });
