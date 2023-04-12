import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { publicProcedure } from "../../trpc";

export const create = publicProcedure
  .meta({
    openapi: {
      summary: "Create Player",
      description:
        "Creates a player with the given ID and an optional name. The ID must be unique, and ideally corresponds with a user ID used by the app integrating with 2bttns.",
      tags: [OPENAPI_TAGS.PLAYERS],
      method: "GET",
      path: "/players/create",
    },
  })
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
    })
  )
  .output(
    z.object({
      createdPlayer: z.object({
        id: z.string(),
        name: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
      }),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const createdPlayer = await ctx.prisma.player.create({
      data: {
        id: input.id,
        name: input.name,
      },
    });

    return {
      createdPlayer,
    };
  });
