import { Box, ButtonGroup, HStack } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import {
  ColumnDef,
  createColumnHelper,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { tagFilter } from "../../../server/shared/z";
import { api, RouterInputs, RouterOutputs } from "../../../utils/api";
import CustomEditable from "../../shared/components/CustomEditable";
import PaginatedTable from "../../shared/components/Table/containers/PaginatedTable";
import SearchAndCreateBar from "../../shared/components/Table/containers/SearchAndCreateBar";
import usePageCount from "../../shared/components/Table/hooks/usePageCount";
import TagMultiSelect, { TagOption } from "./TagMultiSelect";

export type GameObjectData =
  RouterOutputs["gameObjects"]["getAll"]["gameObjects"][0];

export const columnHelper = createColumnHelper<GameObjectData>();

export type GameObjectsTableProps = {
  tag?: typeof tagFilter._type;
  onGameObjectCreated?: (gameObjectId: string) => Promise<void>;
  additionalColumns?: ColumnDef<GameObjectData>[];
  additionalActions?: (gameObjectData: GameObjectData) => React.ReactNode;
  gameObjectsToExclude?: GameObjectData["id"][];
  additionalTopBarContent?: React.ReactNode;
  editable?: boolean;
};

export default function GameObjectsTable(props: GameObjectsTableProps) {
  const {
    tag,
    onGameObjectCreated,
    additionalColumns,
    additionalActions,
    gameObjectsToExclude,
    additionalTopBarContent,
    editable = true,
  } = props;

  const utils = api.useContext();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { pageIndex, pageSize } = pagination;

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const getSort = (id: keyof GameObjectData) => {
    const result = sorting.find((s) => s.id === id);
    if (result === undefined) {
      return undefined;
    }

    return result.desc ? "desc" : "asc";
  };

  const gameObjectsQuery = api.gameObjects.getAll.useQuery(
    {
      includeTags: true,
      skip: pageIndex * pageSize,
      take: pageSize,
      filter: globalFilter
        ? {
            mode: "OR",
            id: { contains: globalFilter },
            name: { contains: globalFilter },
            tag,
          }
        : {
            tag,
          },
      sort: {
        id: getSort("id"),
        name: getSort("name"),
        description: getSort("description"),
        tags: getSort("tags"),
        updatedAt: getSort("updatedAt"),
      },
      excludeGameObjects: gameObjectsToExclude,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const gameObjectsCountQuery = api.gameObjects.getCount.useQuery(
    {
      filter: globalFilter
        ? {
            mode: "OR",
            id: { contains: globalFilter },
            name: { contains: globalFilter },
            tag,
          }
        : {
            tag,
          },
      excludeGameObjects: gameObjectsToExclude,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const { pageCount } = usePageCount({
    pagination,
    setPagination,
    itemCount: gameObjectsCountQuery.data?.count ?? 0,
  });

  const updateGameObjectMutation = api.gameObjects.updateById.useMutation();

  const handleUpdateGameObject = async (
    id: string,
    data: RouterInputs["gameObjects"]["updateById"]["data"]
  ) => {
    try {
      await updateGameObjectMutation.mutateAsync({ id, data });
      await utils.gameObjects.invalidate();
    } catch (error) {
      // This will be caught by CustomEditable component using this function
      // it will revert the value to the previous value when it receives an error
      throw error;
    }
  };

  const createGameObjectMutation = api.gameObjects.create.useMutation();
  const handleCreateGameObject = async (name: string) => {
    try {
      const result = await createGameObjectMutation.mutateAsync({ name });
      if (onGameObjectCreated) {
        await onGameObjectCreated(result.createdGameObject.id);
      }
      await utils.gameObjects.invalidate();
    } catch (error) {
      window.alert("Error creating Game Object\n See console for details");
      console.error(error);
    }
  };

  const columns = useMemo<ColumnDef<GameObjectData, any>[]>(() => {
    const items: ColumnDef<GameObjectData, any>[] = [
      columnHelper.accessor("id", {
        cell: (info) => (
          <CustomEditable
            value={info.getValue()}
            placeholder="No ID"
            handleSave={async (nextValue) =>
              handleUpdateGameObject(info.row.original.id, {
                id: nextValue,
              })
            }
            isEditable={editable}
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("name", {
        cell: (info) => (
          <CustomEditable
            value={info.getValue()}
            placeholder="No name"
            handleSave={async (nextValue) =>
              handleUpdateGameObject(info.row.original.id, {
                name: nextValue,
              })
            }
            isEditable={editable}
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("description", {
        cell: (info) => (
          <CustomEditable
            value={info.getValue() ?? ""}
            placeholder="No description"
            handleSave={async (nextValue) =>
              handleUpdateGameObject(info.row.original.id, {
                description: nextValue,
              })
            }
            isEditable={editable}
          />
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("tags", {
        cell: (info) => {
          const tags = (info.getValue() as Tag[]) || undefined;
          const selected: TagOption[] =
            tags?.map((tag: Tag) => ({
              label: tag.name || "Untitled Tag",
              value: tag.id,
            })) || [];

          return (
            <Box width="256px">
              <TagMultiSelect
                selected={selected}
                onChange={(nextTags) => {
                  handleUpdateGameObject(info.row.original.id, {
                    tags: nextTags,
                  });
                }}
                isEditable={editable}
              />
            </Box>
          );
        },
        enableSorting: true,
      }),
      columnHelper.accessor("updatedAt", {
        header: "Last Updated",
        cell: (info) => info.getValue().toLocaleString(),
        enableSorting: true,
      }),
    ];

    if (additionalColumns) {
      items.push(...additionalColumns);
    }

    if (additionalActions) {
      items.push({
        id: "actions",
        header: "",
        cell: (info) => {
          return (
            <ButtonGroup width="100%" justifyContent="end">
              {additionalActions(info.row.original)}
            </ButtonGroup>
          );
        },
      });
    }

    return items;
  }, [gameObjectsToExclude]);

  return (
    <Box height="100%">
      <HStack width="100%">
        <SearchAndCreateBar
          value={globalFilter}
          onChange={setGlobalFilter}
          onCreate={handleCreateGameObject}
        />
        {additionalTopBarContent}
      </HStack>
      <PaginatedTable
        columns={columns}
        data={gameObjectsQuery.data?.gameObjects ?? []}
        onPaginationChange={setPagination}
        pagination={pagination}
        pageCount={pageCount}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </Box>
  );
}
