import { createTRPCRouter } from "../../trpc";
import { create } from "./create";
import { deleteGames } from "./delete";
import { deleteById } from "./deleteById";
import { getAll } from "./getAll";
import { getById } from "./getById";
import { getCount } from "./getCount";
import { getPlayerScores } from "./getPlayerScores";
import { updateById } from "./updateById";

export const gamesRouter = createTRPCRouter({
  create,
  getAll,
  getCount,
  getById,
  delete: deleteGames,
  deleteById,
  updateById,
  getPlayerScores,
});
