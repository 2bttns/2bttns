import { api } from "../../../utils/api";

export default function useGameObjectCount() {
  const gameObjectCountQuery = api.gameObjects.getCount.useQuery();
  return gameObjectCountQuery.data;
}
