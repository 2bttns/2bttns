import { createTRPCRouter } from "../../trpc";
import { create } from "./create";
import { deleteById } from "./deleteById";
import { getAll } from "./getAll";
import { getById } from "./getById";
import { getCount } from "./getCount";
import { getPlayerScores } from "./getPlayerScores";
import { processGameResults } from "./processGameResults";
import { updateById } from "./updateById";

export const gamesRouter = createTRPCRouter({
  create,
  getAll,
  getCount,
  getById,
  deleteById,
  updateById,
  processGameResults,
  getPlayerScores,
});
