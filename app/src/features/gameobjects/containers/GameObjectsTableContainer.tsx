import { AddIcon, DeleteIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  ButtonGroup,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Kbd,
  Stack,
  Tooltip,
} from "@chakra-ui/react";
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { api, RouterInputs, RouterOutputs } from "../../../utils/api";
import CustomEditable from "../../shared/components/CustomEditable";
import GameObjectsTable from "../views/GameObjectsTable";

export type GameObjectData =
  RouterOutputs["gameObjects"]["getAll"]["gameObjects"][0];

const columnHelper = createColumnHelper<GameObjectData>();

export type GameObjectsTableContainerProps = {};

export default function GameObjectsTableContainer(
  props: GameObjectsTableContainerProps
) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { pageIndex, pageSize } = pagination;

  const [globalFilter, setGlobalFilter] = useState("");

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
            tag: { contains: globalFilter },
          }
        : undefined,
    },
    {
      keepPreviousData: true,
    }
  );

  const gameObjectsCountQuery = api.gameObjects.getCount.useQuery(
    {
      filter: globalFilter
        ? {
            mode: "OR",
            id: { contains: globalFilter },
            name: { contains: globalFilter },
            tag: { contains: globalFilter },
          }
        : undefined,
    },
    {
      keepPreviousData: true,
    }
  );

  const updateGameObjectMutation = api.gameObjects.updateById.useMutation();

  const handleUpdateGameObject = async (
    id: string,
    data: RouterInputs["gameObjects"]["updateById"]["data"]
  ) => {
    await updateGameObjectMutation.mutateAsync({ id, data });
    await gameObjectsCountQuery.refetch();
    await gameObjectsQuery.refetch();
  };

  const deleteGameObjectMutation = api.gameObjects.deleteById.useMutation();

  const handleDeleteGameObject = async (id: string) => {
    try {
      await deleteGameObjectMutation.mutateAsync({ id });
      await gameObjectsCountQuery.refetch();
      await gameObjectsQuery.refetch();
    } catch (error) {
      window.alert("Error deleting game object\n See console for details");
      console.error(error);
    }
  };

  const createGameObjectMutation = api.gameObjects.create.useMutation();
  const handleCreateGameObject = async (name: string) => {
    try {
      await createGameObjectMutation.mutateAsync({ name });
      await gameObjectsCountQuery.refetch();
      await gameObjectsQuery.refetch();
    } catch (error) {
      window.alert("Error creating game object\n See console for details");
      console.error(error);
    }
  };

  const columns = useMemo<ColumnDef<GameObjectData, any>[]>(
    () => [
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
          />
        ),
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
          />
        ),
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
          />
        ),
      }),
      columnHelper.accessor("tags", {
        cell: (info) => {
          if (!info.getValue() || info.getValue().length === 0)
            return "No tags";
          return info
            .getValue()
            .map((tag: GameObjectData["tags"][0]) => tag.name)
            .join(", ");
        },
      }),
      columnHelper.accessor("updatedAt", {
        header: "Last Updated",
        cell: (info) => info.getValue().toLocaleString(),
      }),
      {
        id: "actions",
        header: "",
        cell: (info) => {
          const { id } = info.row.original;
          return (
            <ButtonGroup width="100%" justifyContent="end">
              <Tooltip label={`Delete`} placement="top">
                <IconButton
                  colorScheme="red"
                  onClick={() => {
                    handleDeleteGameObject(id);
                  }}
                  icon={<DeleteIcon />}
                  aria-label={`Delete gameobject with ID: ${id}`}
                  size="sm"
                  variant="outline"
                />
              </Tooltip>
            </ButtonGroup>
          );
        },
      },
    ],
    []
  );

  const pageCount = useMemo(() => {
    if (!gameObjectsCountQuery.data) return 0;
    return Math.ceil(gameObjectsCountQuery.data.count / pageSize);
  }, [gameObjectsCountQuery.data, pagination.pageSize]);

  useEffect(() => {
    // If the page index is out of bounds, reset it to the last page
    if (pageIndex >= pageCount) {
      setPagination((prev) => ({ ...prev, pageIndex: pageCount - 1 }));
      return;
    }

    // Otherwise, if the page index is less than 0, reset it to 0
    // Only do this if the page count is greater than 0; or else, we'll get stuck in an infinite loop from the queries
    if (pageCount === 0) return;
    if (pageIndex < 0) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      return;
    }
  }, [pageCount, pageIndex]);

  const table = useReactTable({
    data: gameObjectsQuery.data?.gameObjects ?? [],
    columns,
    pageCount,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    debugTable: true,
  });

  return (
    <Box>
      <Stack direction="row" sx={{ padding: "1rem" }}>
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            color="gray.300"
            fontSize="1.2em"
          >
            <SearchIcon />
          </InputLeftElement>
          <Input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search by name, id, or tag"
            onKeyUp={(e) => {
              if (e.key === "Enter" && e.shiftKey) {
                if (!globalFilter) return;
                handleCreateGameObject(globalFilter);
              }
            }}
          />
          <InputRightElement fontSize="1.2em">
            <Tooltip
              label={
                <Stack
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  spacing="0"
                  padding="0.5rem"
                >
                  <div>Create new item with input as name</div>
                  <div>
                    <Kbd backgroundColor="gray.900">shift</Kbd>
                    <span>+</span>
                    <Kbd backgroundColor="gray.900">enter</Kbd>
                  </div>
                </Stack>
              }
              placement="bottom-end"
              hasArrow
            >
              <IconButton
                colorScheme="blue"
                icon={<AddIcon />}
                aria-label="Create new item"
                size="sm"
                onClick={() => {
                  if (!globalFilter) return;
                  handleCreateGameObject(globalFilter);
                }}
              />
            </Tooltip>
          </InputRightElement>
        </InputGroup>
      </Stack>
      <GameObjectsTable
        columns={columns}
        gameObjects={gameObjectsQuery.data?.gameObjects ?? []}
        onPaginationChange={setPagination}
        pagination={pagination}
        pageCount={pageCount}
      />
    </Box>
  );
}
