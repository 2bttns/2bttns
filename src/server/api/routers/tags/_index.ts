import { createTRPCRouter } from "../../trpc";
import { create } from "./create";
import { deleteTags } from "./delete";
import { deleteById } from "./deleteById";
import { getAll } from "./getAll";
import { getById } from "./getById";
import { getCount } from "./getCount";
import { updateById } from "./updateById";

export const tagsRouter = createTRPCRouter({
  create,
  getAll,
  getCount,
  getById,
  delete: deleteTags,
  deleteById,
  updateById,
});
