import { createTRPCRouter } from "../../trpc";
import { create } from "./create";
import { deleteById } from "./deleteById";
import { getAll } from "./getAll";
import { getById } from "./getById";
import { updateById } from "./updateById";

export const gamesRouter = createTRPCRouter({
  create,
  getAll,
  getById,
  deleteById,
  updateById,
});
