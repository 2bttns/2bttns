import { type inferProcedureInput } from "@trpc/server";
import { expect, test } from "vitest";
import { AppRouter, appRouter } from "../../root";
import { createInnerTRPCContext } from "../../trpc";

test("example router", async () => {
  const ctx = await createInnerTRPCContext({ session: null });
  const caller = appRouter.createCaller(ctx);

  type Input = inferProcedureInput<AppRouter["example"]["hello"]>;
  const input: Input = {
    text: "test",
  };

  const example = await caller.example.hello(input);
  expect(example).toMatchObject({ greeting: "Hello test" });
});
