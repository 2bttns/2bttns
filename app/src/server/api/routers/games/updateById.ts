import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { idSchema } from "../../../shared/z";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";

const input = z.object({
  id: idSchema,
  data: z.object({
    id: idSchema.optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    inputTags: z.array(z.string()).optional(),
    defaultNumItemsPerRound: z.number().nullable().optional(),
    mode: z.string().optional(),
    modeConfigJson: z.string().optional(),
    customCss: z.string().optional(),
  }),
});

const output = z.object({
  updatedGameObject: z.object({
    id: z.string(),
    createdAt: z.string().describe("ISO date string"),
    updatedAt: z.string().describe("ISO date string"),
    name: z.string(),
    description: z.string().nullable(),
    defaultNumItemsPerRound: z.number().nullable(),
    mode: z.string(),
    modeConfigJson: z.string().nullable(),
    customCss: z.string().nullable(),
  }),
});

export const updateById = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Update Game by ID",
      description: "Update a Game by its ID",
      tags: [OPENAPI_TAGS.GAMES],
      method: "PUT",
      path: "/games/{id}",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .mutation(async ({ ctx, input }) => {
    console.log(input);

    if (input.data.modeConfigJson) {
      try {
        JSON.parse(input.data.modeConfigJson);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid modeConfigJson",
        });
      }
    }

    const updatedGameObject = await ctx.prisma.game.update({
      where: {
        id: input.id,
      },
      data: {
        id: input.data.id,
        name: input.data.name,
        description: input.data.description,
        updatedAt: new Date(), // Explicit update of updatedAt; otherwise inputTags.set won't trigger the default updatedAt update
        inputTags: {
          set: input.data.inputTags?.map((tag) => ({ id: tag })),
        },
        defaultNumItemsPerRound: input.data.defaultNumItemsPerRound,
        mode: input.data.mode,
        modeConfigJson: input.data.modeConfigJson,
        customCss: input.data.customCss,
      },
    });

    return {
      updatedGameObject: {
        ...updatedGameObject,
        createdAt: updatedGameObject.createdAt.toISOString(),
        updatedAt: updatedGameObject.updatedAt.toISOString(),
      },
    };
  });
