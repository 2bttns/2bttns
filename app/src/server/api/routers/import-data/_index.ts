import { createTRPCRouter } from "../../trpc";
import { importData } from "./importData";

export const importDataRouter = createTRPCRouter({
  importData,
});
