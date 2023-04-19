import { createInnerTRPCContext } from "../../../../src/server/api/trpc";

export const createInnerTRPCContextWithSessionForTest = () => {
  return createInnerTRPCContext({
    session: {
      user: { id: "123", name: "Test" },
      expires: "1",
    },
  });
};
