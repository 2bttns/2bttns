import { PrismaPromise } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { OPENAPI_TAGS } from "../../openapi/openApiTags";
import { adminOrApiKeyProtectedProcedure } from "../../trpc";
import { output as exportDataOutput } from "../export-data/exportData";

const input = z.object({
  jsonBase64: z.string().describe("Base64 encoded JSON file to import"),
});

const output = z.object({
  message: z.string(),
});

export const importData = adminOrApiKeyProtectedProcedure
  .meta({
    openapi: {
      summary: "Import Data",
      description: "Import 2bttns data from a JSON file.",
      tags: [OPENAPI_TAGS.IMPORT_DATA],
      method: "POST",
      path: "/import-data",
      protect: true,
    },
  })
  .input(input)
  .output(output)
  .mutation(async ({ input, ctx }) => {
    const { jsonBase64 } = input;

    try {
      const buffer = Buffer.from(jsonBase64, "base64");
      const jsonStr = buffer.toString("utf-8");
      const json = JSON.parse(jsonStr);
      const validated = exportDataOutput.parse(json);

      const queries: PrismaPromise<any>[] = [];

      if (validated.tags && validated.tags.length > 0) {
        // Create tags
        queries.push(
          ctx.prisma.tag.createMany({
            data: validated.tags?.map((tag) => ({
              id: tag.id,
              name: tag.name,
            })),
          })
        );
      }

      if (validated.gameObjects && validated.gameObjects.length > 0) {
        // Create game objects
        queries.push(
          ctx.prisma.gameObject.createMany({
            data: validated.gameObjects?.map((gameObject) => ({
              name: gameObject.name,
              description: gameObject.description,
              id: gameObject.id,
            })),
          })
        );

        // Apply imported tags to corresponding game objects
        if (validated.tags && validated.tags.length > 0) {
          queries.push(
            ...validated.gameObjects.map((gameObject) => {
              return ctx.prisma.gameObject.update({
                where: { id: gameObject.id },
                data: {
                  tags: {
                    connect: gameObject.tagIds?.map((id) => ({ id })),
                  },
                },
              });
            })
          );
        }
      }

      if (validated.games && validated.games.length > 0) {
        // Create games
        queries.push(
          ctx.prisma.game.createMany({
            data: validated.games?.map((game) => ({
              id: game.id,
              name: game.name,
              description: game.description,
            })),
          })
        );

        // Apply imported input tags to corresponding games
        if (validated.tags && validated.tags.length > 0) {
          queries.push(
            ...validated.games?.map((game) => {
              return ctx.prisma.game.update({
                where: { id: game.id },
                data: {
                  inputTags: {
                    connect: game.inputTagIds?.map((id) => ({ id })),
                  },
                },
              });
            })
          );
        }
      }

      // All or nothing transaction
      // TODO: Allow import of partial data
      await ctx.prisma.$transaction(queries);

      return {
        message: `Successfully imported ${validated.count?.tags ?? 0} tag(s), ${
          validated.count?.games ?? 0
        } game(s), and ${validated.count?.gameObjects ?? 0} game object(s).`,
      };
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: (error as Error).message,
      });
    }
  });
