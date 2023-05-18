import { createTRPCRouter } from "../../trpc";
import { create } from "./create";
import { getAll } from "./getAll";
import { getSecretMessage } from "./getSecretMessage";
import { hello } from "./hello";

export const exampleRouter = createTRPCRouter({
  hello,
  create,
  getAll,
  getSecretMessage,
});
