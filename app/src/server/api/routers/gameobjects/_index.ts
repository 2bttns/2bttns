import { getRelationship } from "./getRelationship";
import { createTRPCRouter } from "../../trpc";
import { create } from "./create";
import { deleteById } from "./deleteById";
import { getAll } from "./getAll";
import { getById } from "./getById";
import { getCount } from "./getCount";
import { updateById } from "./updateById";
import { upsertPlayerScore } from "./upsertPlayerScore";
import { upsertRelationship } from "./upsertRelationship";

export const gameObjectsRouter = createTRPCRouter({
  create,
  getAll,
  getCount,
  getById,
  deleteById,
  updateById,
  upsertPlayerScore,
  getRelationship,
  upsertRelationship,
});
