import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
  data: z
    .object({
      id: idSchema.optional(),
      name: z.string().optional(),
    })
    .optional(),
});

const output = z.object({
  updatedPlayer: z.object({
    id: z.string(),
    name: z.string().nullable().optional(),
    createdAt: z.string().describe("ISO date string"),
    updatedAt: z.string().describe("ISO date string"),
  }),
});

export const updateById = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Update Player by ID",
      description: "Update player by ID.",
      tags: [OPENAPI_TAGS.PLAYERS],
      method: "PUT",
      path: "/players/{id}",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .mutation(async ({ ctx, input }) => {
    const updatedPlayer = await ctx.prisma.player.update({
      where: {
        id: input.id,
      },
      data: {
        id: input.data?.id,
        name: input.data?.name,
      },
    });

    const processedUpdatedPlayer: (typeof output._type)["updatedPlayer"] = {
      ...updatedPlayer,
      createdAt: updatedPlayer.createdAt.toISOString(),
      updatedAt: updatedPlayer.updatedAt.toISOString(),
    };

    return {
      updatedPlayer: processedUpdatedPlayer,
    };
  });
