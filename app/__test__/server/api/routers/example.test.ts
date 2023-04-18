import { type inferProcedureInput } from "@trpc/server";
import { describe, expect, test } from "vitest";
import { AppRouter, appRouter } from "../../../../src/server/api/root";
import { createInnerTRPCContext } from "../../../../src/server/api/trpc";

describe("example router", () => {
  test("greeting", async () => {
    const ctx = createInnerTRPCContext({ session: null });
    const caller = appRouter.createCaller(ctx);

    type Input = inferProcedureInput<AppRouter["example"]["hello"]>;
    const input: Input = {
      text: "test",
    };

    const example = await caller.example.hello(input);
    expect(example).toMatchObject({ greeting: "Hello test" });
  });

  test("getSecretMessage with session", async () => {
    const ctx = createInnerTRPCContext({
      session: {
        user: { id: "123", name: "John Doe" },
        expires: "1",
      },
    });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.example.getSecretMessage();
    expect(result).toEqual("you can now see this secret message!");
  });

  test("getSecretMessage without session", async () => {
    const ctx = createInnerTRPCContext({ session: null });
    const caller = appRouter.createCaller(ctx);
    await expect(() => caller.example.getSecretMessage()).rejects.toThrow();
  });
});
