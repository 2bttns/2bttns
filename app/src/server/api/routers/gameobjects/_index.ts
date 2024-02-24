import { createTRPCRouter } from "../../trpc";
import { create } from "./create";
import { deleteGameObjects } from "./delete";
import { deleteById } from "./deleteById";
import { deleteRelationship } from "./deleteRelationship";
import { getAll } from "./getAll";
import { getById } from "./getById";
import { getCount } from "./getCount";
import { getRanked } from "./getRanked";
import { getRelationship } from "./getRelationship";
import { updateById } from "./updateById";
import { upsertPlayerScore } from "./upsertPlayerScore";
import { upsertRelationship } from "./upsertRelationship";

export const gameObjectsRouter = createTRPCRouter({
  getRanked,
  create,
  getAll,
  getCount,
  getById,
  delete: deleteGameObjects,
  deleteById,
  updateById,
  upsertPlayerScore,
  getRelationship,
  upsertRelationship,
  deleteRelationship,
});
