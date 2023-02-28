import { createTRPCRouter } from "../../trpc";
import { create } from "./create";
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
  create,
  getAll,
  getCount,
  getById,
  deleteById,
  updateById,
  upsertPlayerScore,
  getRelationship,
  upsertRelationship,
  deleteRelationship,
  getRanked,
});
