import { createTRPCRouter } from "../../trpc";
import { getAll } from "./getAll";
import { getCount } from "./getCount";

export const administratorsRouter = createTRPCRouter({
  getAll,
  getCount,
  // getById,
  // deleteById,
  // updateById,
});
