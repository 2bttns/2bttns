import { Box, HStack, StackProps, useToast } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { useMemo } from "react";
import { z } from "zod";
import { OutputTag } from "../../../server/api/routers/gameobjects/getAll";
import { untaggedFilterEnum } from "../../../server/shared/z";
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

export const columnIds = {
  ID: "id",
  NAME: "name",
  TAGS: "tags",
  UPDATED_AT: "updatedAt",
};

export type GameObjectsTableProps = {
  tag?: {
    include: Tag["id"][];
    exclude: Tag["id"][];
    untaggedFilter: z.infer<typeof untaggedFilterEnum>;
  };
  onGameObjectCreated?: (gameObjectId: string) => Promise<void>;
  additionalColumns?: PaginatedTableProps<GameObjectData>["additionalColumns"];
  gameObjectsToExclude?: GameObjectData["id"][];
  additionalTopBarContent?: (selectedRows: GameObjectData[]) => React.ReactNode;
  editable?: boolean;
  constrainToRemainingSpaceProps?: Partial<ConstrainToRemainingSpaceProps>;
  topBarProps?: Partial<StackProps>;
  allowCreate?: boolean;
  onRowDoubleClicked?: PaginatedTableProps<GameObjectData>["onRowDoubleClicked"];
  omitColumns?: (keyof typeof columnIds)[];
  defaultSortFieldId?: PaginatedTableProps<GameObjectData>["defaultSortFieldId"];
  defaultSortAsc?: PaginatedTableProps<GameObjectData>["defaultSortAsc"];
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
    onRowDoubleClicked,
    omitColumns,
    defaultSortFieldId,
    defaultSortAsc,
  } = props;

  const toast = useToast();

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
      allowFuzzyIdFilter: true,
      nameFilter: globalFilter.debouncedInput,
      allowFuzzyNameFilter: true,
      tagFilter: tag?.include.join(","),
      tagExcludeFilter: tag?.exclude.join(","),
      untaggedFilter: tag?.untaggedFilter,
      sortField: sorting?.sortField,
      sortOrder: sorting?.order,
      excludeGameObjects: gameObjectsToExclude?.join(","),
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
      allowFuzzyIdFilter: true,
      nameFilter: globalFilter.debouncedInput,
      allowFuzzyNameFilter: true,
      tagFilter: tag?.include.join(","),
      tagExcludeFilter: tag?.exclude.join(","),
      untaggedFilter: tag?.untaggedFilter,
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
    const updateDescription = `ID=${id}`;
    const updateToast = toast({
      title: "Updating GameObject",
      description: updateDescription,
      status: "loading",
    });
    try {
      await updateGameObjectMutation.mutateAsync({ id, data });
      await utils.gameObjects.invalidate();
      toast.update(updateToast, {
        title: "Success: GameObject Updated",
        description: updateDescription,
        status: "success",
      });
    } catch (error) {
      toast.update(updateToast, {
        title: "Error",
        description: `Failed to update GameObject (ID=${id}). See console for details`,
        status: "error",
      });

      // This will be caught by CustomEditable component using this function
      // it will revert the value to the previous value when it receives an error
      throw error;
    }
  };

  const createGameObjectMutation = api.gameObjects.create.useMutation();
  const handleCreateGameObject = async (name: string) => {
    const createDescription = `Name=${name}`;
    const createToast = toast({
      title: "Creating GameObject",
      description: createDescription,
      status: "loading",
    });

    try {
      const result = await createGameObjectMutation.mutateAsync({ name });
      if (onGameObjectCreated) {
        await onGameObjectCreated(result.createdGameObject.id);
      }
      await utils.gameObjects.invalidate();
      toast.update(createToast, {
        title: "Success: GameObject Created",
        description: createDescription,
        status: "success",
      });
    } catch (error) {
      console.error(error);
      toast.update(createToast, {
        title: "Error",
        description: `Failed to create GameObject (Name=${name}). See console for details`,
        status: "error",
      });
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
        id: columnIds.ID,
        sortField: columnIds.ID,
        minWidth: "256px",
        omit: omitColumns?.includes("ID"),
        reorder: true,
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
        id: columnIds.NAME,
        sortField: columnIds.NAME,
        minWidth: "256px",
        omit: omitColumns?.includes("NAME"),
        reorder: true,
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
        id: columnIds.TAGS,
        sortField: columnIds.TAGS,
        minWidth: "256px",
        omit: omitColumns?.includes("TAGS"),
        reorder: true,
      },
      {
        name: "Last Updated",
        cell: (row) => new Date(row.updatedAt).toLocaleString(),
        sortable: true,
        id: columnIds.UPDATED_AT,
        sortField: columnIds.UPDATED_AT,
        minWidth: "256px",
        omit: omitColumns?.includes("UPDATED_AT"),
        reorder: true,
      },
    ];
  }, [editable, tagDataById, omitColumns]);

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
              onRowDoubleClicked={onRowDoubleClicked}
              defaultSortFieldId={defaultSortFieldId}
              defaultSortAsc={defaultSortAsc}
            />
          );
        }}
      </ConstrainToRemainingSpace>
    </Box>
  );
}
