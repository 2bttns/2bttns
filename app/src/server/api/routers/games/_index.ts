import { createTRPCRouter } from "../../trpc";
import { create } from "./create";
import { deleteById } from "./deleteById";
import { getAll } from "./getAll";
import { updateGameById } from "./updateGameById";

export const gamesRouter = createTRPCRouter({
  create,
  getAll,
  deleteById,
  updateGameById,
});
