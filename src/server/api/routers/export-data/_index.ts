import { createTRPCRouter } from "../../trpc";
import { exportData } from "./exportData";

export const exportDataRouter = createTRPCRouter({
  exportData,
});
