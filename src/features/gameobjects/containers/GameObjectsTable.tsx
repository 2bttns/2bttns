import { Box, HStack } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { useMemo, useState } from "react";
import { tagFilter } from "../../../server/shared/z";
import { api, RouterInputs, RouterOutputs } from "../../../utils/api";
import ConstrainToRemainingSpace, {
  ConstrainToRemainingSpaceProps,
} from "../../shared/components/ConstrainToRemainingSpace";
import CustomEditable from "../../shared/components/CustomEditable";
import PaginatedTable, {
  PaginatedTableProps,
} from "../../shared/components/Table/containers/PaginatedTable";
import SearchAndCreateBar from "../../shared/components/Table/containers/SearchAndCreateBar";
import TagMultiSelect, { TagOption } from "./TagMultiSelect";

export type GameObjectData =
  RouterOutputs["gameObjects"]["getAll"]["gameObjects"][0];

export type GameObjectsTableProps = {
  tag?: typeof tagFilter._type;
  onGameObjectCreated?: (gameObjectId: string) => Promise<void>;
  additionalColumns?: PaginatedTableProps<GameObjectData>["additionalColumns"];
  gameObjectsToExclude?: GameObjectData["id"][];
  additionalTopBarContent?: React.ReactNode;
  editable?: boolean;
  constrainToRemainingSpaceProps?: Partial<ConstrainToRemainingSpaceProps>;
};

export default function GameObjectsTable(props: GameObjectsTableProps) {
  const {
    tag,
    onGameObjectCreated,
    additionalColumns,
    gameObjectsToExclude,
    additionalTopBarContent,
    editable = true,
    constrainToRemainingSpaceProps,
  } = props;

  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const handlePageChange: PaginatedTableProps<GameObjectData>["onChangePage"] =
    (page) => {
      setCurrentPage(page);
    };
  const handlePerRowsChange: PaginatedTableProps<GameObjectData>["onChangeRowsPerPage"] =
    async (newPerPage, page) => {
      setCurrentPage(page);
      setPerPage(newPerPage);
    };

  const utils = api.useContext();
  const [globalFilter, setGlobalFilter] = useState("");

  const [sorting, setSorting] = useState<{
    column: keyof GameObjectData;
    order: "asc" | "desc";
  } | null>(null);
  const handleSort: PaginatedTableProps<GameObjectData>["onSort"] = (
    column,
    sortDirection
  ) => {
    setSorting({
      column: column.sortField as keyof GameObjectData,
      order: sortDirection,
    });
  };

  const getSort = (column: keyof GameObjectData) => {
    if (!sorting) return undefined;
    if (sorting.column !== column) return undefined;
    return sorting.order;
  };

  const gameObjectsQuery = api.gameObjects.getAll.useQuery(
    {
      includeTags: true,
      skip: (currentPage! - 1) * perPage,
      take: perPage,
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
      enabled: currentPage !== null,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );
  const data: GameObjectData[] = gameObjectsQuery.data?.gameObjects ?? [];

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

  const columns = useMemo<
    PaginatedTableProps<GameObjectData>["columns"]
  >(() => {
    return [
      {
        name: "ID",
        cell: (row) => (
          <CustomEditable
            value={row.id}
            placeholder="No ID"
            handleSave={async (nextValue) =>
              handleUpdateGameObject(row.id, {
                id: nextValue,
              })
            }
            isEditable={editable}
          />
        ),
        sortable: true,
        sortField: "id",
      },
      {
        name: "Name",
        cell: (row) => (
          <CustomEditable
            value={row.name}
            placeholder="No name"
            handleSave={async (nextValue) =>
              handleUpdateGameObject(row.id, {
                name: nextValue,
              })
            }
            isEditable={editable}
          />
        ),
        sortable: true,
        sortField: "name",
      },
      {
        name: "Description",
        cell: (row) => (
          <CustomEditable
            value={row.description ?? undefined}
            placeholder="No description"
            handleSave={async (nextValue) =>
              handleUpdateGameObject(row.id, {
                description: nextValue,
              })
            }
            isEditable={editable}
          />
        ),
        sortable: true,
        sortField: "description",
      },
      {
        name: "Tags",
        cell: (row) => {
          const selected: TagOption[] =
            row.tags?.map((tag: Tag) => ({
              label: tag.name || "Untitled Tag",
              value: tag.id,
            })) || [];

          return (
            <Box width="256px">
              <TagMultiSelect
                selected={selected}
                onChange={(nextTags) => {
                  handleUpdateGameObject(row.id, {
                    tags: nextTags,
                  });
                }}
                isEditable={editable}
              />
            </Box>
          );
        },
        sortable: true,
        sortField: "tags",
      },
      {
        name: "Last Updated",
        cell: (row) => row.updatedAt.toLocaleString(),
        sortable: true,
        sortField: "updatedAt",
      },
    ];
  }, [editable]);

  const [selectedRows, setSelectedRows] = useState<GameObjectData[]>([]);
  const handleSelectedRowsChange: PaginatedTableProps<GameObjectData>["onSelectedRowsChange"] =
    (selected) => {
      setSelectedRows(selected.selectedRows);
    };

  return (
    <Box>
      <HStack width="100%">
        <SearchAndCreateBar
          value={globalFilter}
          onChange={setGlobalFilter}
          onCreate={handleCreateGameObject}
        />
        {additionalTopBarContent}
      </HStack>
      <ConstrainToRemainingSpace {...constrainToRemainingSpaceProps}>
        {(remainingHeight) => {
          return (
            <PaginatedTable<GameObjectData>
              columns={columns}
              data={data}
              onSort={handleSort}
              additionalColumns={additionalColumns}
              loading={gameObjectsQuery.isLoading}
              totalRows={gameObjectsCountQuery.data?.count ?? 0}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              fixedHeight={remainingHeight}
              onSelectedRowsChange={handleSelectedRowsChange}
            />
          );
        }}
      </ConstrainToRemainingSpace>
    </Box>
  );
}
