import { Box, HStack, StackProps } from "@chakra-ui/react";
import { useMemo } from "react";
import { OutputTag } from "../../../server/api/routers/gameobjects/getAll";
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
import useDebouncedValue from "../../shared/components/Table/hooks/useDebouncedValue";
import usePagination from "../../shared/components/Table/hooks/usePagination";
import useSelectRows from "../../shared/components/Table/hooks/useSelectRows";
import useSort from "../../shared/components/Table/hooks/useSort";
import TagBadges from "../../tags/containers/TagBadges";

export type GameObjectData =
  RouterOutputs["gameObjects"]["getAll"]["gameObjects"][0];

export type GameObjectsTableProps = {
  tag?: typeof tagFilter._type;
  onGameObjectCreated?: (gameObjectId: string) => Promise<void>;
  additionalColumns?: PaginatedTableProps<GameObjectData>["additionalColumns"];
  gameObjectsToExclude?: GameObjectData["id"][];
  additionalTopBarContent?: (selectedRows: GameObjectData[]) => React.ReactNode;
  editable?: boolean;
  constrainToRemainingSpaceProps?: Partial<ConstrainToRemainingSpaceProps>;
  topBarProps?: Partial<StackProps>;
  allowCreate?: boolean;
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
    topBarProps,
    allowCreate = true,
  } = props;

  const { perPage, currentPage, handlePageChange, handlePerRowsChange } =
    usePagination();
  const { sorting, handleSort } = useSort<GameObjectData>();

  const utils = api.useContext();
  const globalFilter = useDebouncedValue();

  const gameObjectsQuery = api.gameObjects.getAll.useQuery(
    {
      skip: (currentPage! - 1) * perPage,
      take: perPage,
      idFilter: globalFilter.debouncedInput,
      nameFilter: globalFilter.debouncedInput,
      includeTagsFilter: tag?.include.join(",") || undefined,
      excludeTagsFilter: tag?.exclude.join(",") || undefined,
      includeUntaggedResults: tag?.includeUntagged ?? false,
      sortField: sorting?.sortField,
      sortOrder: sorting?.order,
      excludeGameObjects: gameObjectsToExclude?.join(",") || undefined,
      includeTagData: true,
    },
    {
      enabled: currentPage !== null,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );
  const gameObjects: GameObjectData[] =
    gameObjectsQuery.data?.gameObjects ?? [];

  const tagDataById = useMemo(() => {
    if (gameObjectsQuery.isLoading || !gameObjectsQuery.data?.tags) return null;

    const map = new Map<string, OutputTag>();
    gameObjectsQuery.data?.tags?.forEach((tag) => {
      map.set(tag.id, tag);
    });
    return map;
  }, [gameObjectsQuery]);

  const gameObjectsCountQuery = api.gameObjects.getCount.useQuery(
    {
      idFilter: globalFilter.debouncedInput,
      nameFilter: globalFilter.debouncedInput,
      requiredTags: tag?.include.join(",") || undefined,
      excludeTags: tag?.exclude.join(",") || undefined,
      includeUntagged: tag?.includeUntagged ?? false,
      excludeGameObjects: gameObjectsToExclude?.join(",") || undefined,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      retry: false,
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
        minWidth: "256px",
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
        minWidth: "256px",
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
            isTextarea
          />
        ),
        sortable: true,
        sortField: "description",
        minWidth: "512px",
      },
      {
        name: "Tags",
        cell: (row) => {
          return (
            <TagBadges
              selectedTags={row.tags
                .filter((tagId) => {
                  return tagDataById?.get(tagId)?.name !== undefined;
                })
                .map((tagId) => {
                  return {
                    id: tagId,
                    name: tagDataById!.get(tagId)!.name,
                  };
                })}
            />
          );
        },
        sortable: true,
        sortField: "tags",
        minWidth: "256px",
      },
      {
        name: "Last Updated",
        cell: (row) => row.updatedAt.toLocaleString(),
        sortable: true,
        sortField: "updatedAt",
        minWidth: "256px",
      },
    ];
  }, [editable, tagDataById]);

  const { selectedRows, handleSelectedRowsChange, toggleCleared } =
    useSelectRows<GameObjectData>({
      clearRowsUponChangeDependencies: [
        globalFilter.debouncedInput,
        tag,
        perPage,
        currentPage,
      ],
    });

  return (
    <Box>
      <HStack spacing="4px" marginBottom="4px" width="100%" {...topBarProps}>
        <SearchAndCreateBar
          value={globalFilter.input}
          onChange={globalFilter.setInput}
          onCreate={allowCreate ? handleCreateGameObject : undefined}
        />
        {additionalTopBarContent && additionalTopBarContent(selectedRows)}
      </HStack>
      <ConstrainToRemainingSpace {...constrainToRemainingSpaceProps}>
        {(remainingHeight) => {
          return (
            <PaginatedTable<GameObjectData>
              additionalColumns={additionalColumns}
              columns={columns}
              data={gameObjects}
              fixedHeight={remainingHeight}
              itemIdField="id"
              loading={gameObjectsQuery.isLoading}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              onSelectedRowsChange={handleSelectedRowsChange}
              onSort={handleSort}
              selectedRows={selectedRows}
              totalRows={gameObjectsCountQuery.data?.count ?? 0}
              toggleCleared={toggleCleared}
            />
          );
        }}
      </ConstrainToRemainingSpace>
    </Box>
  );
}
