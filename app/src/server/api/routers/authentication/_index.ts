import { createTRPCRouter } from "../../trpc";
import { checkAuthType } from "./checkAuthType";

export const authRouter = createTRPCRouter({
  checkAuthType,
});
