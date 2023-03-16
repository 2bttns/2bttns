import { type inferProcedureInput } from "@trpc/server";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc/index.js";
import { describe, expect, test } from "vitest";
import { AppRouter, appRouter } from "../../root";
import { createInnerTRPCContext } from "../../trpc";

describe("example router", () => {
  test("greeting", async () => {
    const ctx = await createInnerTRPCContext({ session: null });
    const caller = appRouter.createCaller(ctx);

    type Input = inferProcedureInput<AppRouter["example"]["hello"]>;
    const input: Input = {
      text: "test",
    };

    const example = await caller.example.hello(input);
    expect(example).toMatchObject({ greeting: "Hello test" });
  });

  test("getSecretMessage with session", async () => {
    const ctx = await createInnerTRPCContext({
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
    const ctx = await createInnerTRPCContext({ session: null });
    const caller = appRouter.createCaller(ctx);

    const expectedTRPCErrorKey: TRPC_ERROR_CODE_KEY = "UNAUTHORIZED";
    await expect(() => caller.example.getSecretMessage()).rejects.toThrowError(
      expectedTRPCErrorKey
    );
  });
});
