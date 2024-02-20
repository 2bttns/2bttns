import { createTRPCRouter } from "../../trpc";
import { checkAuthType } from "./checkAuthType";
import { getJWT } from "./token";

export const authRouter = createTRPCRouter({
  checkAuthType,
  getJWT,
});
