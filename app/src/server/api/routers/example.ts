import { z } from "zod";
import { OPENAPI_TAGS } from "../openapi/openApiTags";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .meta({
      openapi: {
        summary: "Say hello",
        description: "Say hello to the world",
        tags: [OPENAPI_TAGS.EXAMPLE],
        method: "GET",
        path: "/example/hello",
      },
    })
    .input(z.object({ text: z.string().optional() }))
    .output(z.object({ greeting: z.string() }))
    .query(({ input }) => {
      console.log("hello", input);
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure
    .meta({
      openapi: {
        summary: "Get all examples",
        description: "Get all examples",
        tags: [OPENAPI_TAGS.EXAMPLE],
        method: "GET",
        path: "/example/getAll",
      },
    })
    .input(z.void())
    .output(
      z.object({
        examples: z.array(
          z.object({
            id: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
          })
        ),
      })
    )
    .query(async ({ ctx }) => {
      const examples = await ctx.prisma.example.findMany();
      return { examples };
    }),

  getSecretMessage: protectedProcedure
    .meta({
      openapi: {
        summary: "Get secret message",
        description: "Get secret message",
        tags: [OPENAPI_TAGS.EXAMPLE],
        method: "GET",
        path: "/example/getSecretMessage",
        protect: true,
      },
    })
    .input(z.void())
    .output(z.string())
    .query(() => {
      return "you can now see this secret message!";
    }),
});
