import {
  Box,
  Code,
  HStack,
  StackProps,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { OutputTag } from "../../../server/api/routers/games/getAll";
import { untaggedFilterEnum } from "../../../server/shared/z";
import { api, RouterInputs, RouterOutputs } from "../../../utils/api";
import ConfirmAlert from "../../shared/components/ConfirmAlert";
import ConstrainToRemainingSpace, {
  ConstrainToRemainingSpaceProps,
} from "../../shared/components/ConstrainToRemainingSpace";
import CopyTextButton from "../../shared/components/CopyTextButton";
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

export const columnIds = {
  ID: "id",
  NAME: "name",
  MODE: "mode",
  TAGS: "tags",
  UPDATED_AT: "updatedAt",
};

export type GameData = RouterOutputs["games"]["getAll"]["games"][0];
export type TagData = NonNullable<RouterOutputs["games"]["getAll"]["tags"]>[0];

export type GamesTableProps = {
  tag?: {
    include: TagData["id"][];
    exclude: TagData["id"][];
    untaggedFilter: z.infer<typeof untaggedFilterEnum>;
  };
  onGameCreated?: (gameId: string) => Promise<void>;
  additionalColumns?: PaginatedTableProps<GameData>["additionalColumns"];
  additionalTopBarContent?: (selectedRows: GameData[]) => React.ReactNode;
  editable?: boolean;
  constrainToRemainingSpaceProps?: Partial<ConstrainToRemainingSpaceProps>;
  topBarProps?: Partial<StackProps>;
  allowCreate?: boolean;
  areRowsSelectable?: boolean;
  onRowDoubleClicked?: PaginatedTableProps<GameData>["onRowDoubleClicked"];
  gamesToExclude?: GameData["id"][];
};

export default function GamesTable(props: GamesTableProps) {
  const {
    tag,
    onGameCreated,
    additionalColumns,
    additionalTopBarContent,
    editable = true,
    constrainToRemainingSpaceProps,
    topBarProps,
    allowCreate = true,
    areRowsSelectable = true,
    onRowDoubleClicked,
    gamesToExclude,
  } = props;

  const toast = useToast();
  const router = useRouter();

  const { perPage, currentPage, handlePageChange, handlePerRowsChange } =
    usePagination();
  const { sorting, handleSort } = useSort<GameData>();

  const utils = api.useContext();
  const globalFilter = useDebouncedValue();

  const gamesQuery = api.games.getAll.useQuery(
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
      excludeGames: gamesToExclude?.join(","),
      includeTagData: true,
    },
    {
      enabled: currentPage !== null,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );
  const data: GameData[] = gamesQuery.data?.games ?? [];

  const tagDataById = useMemo(() => {
    if (gamesQuery.isLoading || !gamesQuery.data?.tags) return null;

    const map = new Map<string, OutputTag>();
    gamesQuery.data?.tags?.forEach((tag) => {
      map.set(tag.id, tag);
    });
    return map;
  }, [gamesQuery]);

  const gamesCountQuery = api.games.getCount.useQuery(
    {
      idFilter: globalFilter.debouncedInput,
      nameFilter: globalFilter.debouncedInput,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const updateGameMutation = api.games.updateById.useMutation();
  const handleUpdateGame = async (
    id: string,
    data: RouterInputs["games"]["updateById"]["data"]
  ) => {
    const updateDescription = `Game ID: ${id}`;
    const updateToast = toast({
      title: "Updating Game",
      status: "loading",
      description: updateDescription,
    });
    try {
      await updateGameMutation.mutateAsync({ id, data });
      await utils.games.invalidate();
      toast.update(updateToast, {
        title: "Success: Game Updated",
        status: "success",
        description: updateDescription,
      });
    } catch (error) {
      toast.update(updateToast, {
        title: "Error",
        status: "error",
        description: `Failed to update (Game ID=${id}). See console for details`,
      });

      // This will be caught by CustomEditable component using this function
      // it will revert the value to the previous value when it receives an error
      throw error;
    }
  };

  const createGameMutation = api.games.create.useMutation();
  const [nameToCreateWith, setNameToCreateWith] = useState("");
  const createGameDisclosure = useDisclosure();
  const openCreateGameConfirmation = async (name: string) => {
    createGameDisclosure.onOpen();
    setNameToCreateWith(name);
  };

  const handleCreateConfirm = async () => {
    const createToast = toast({
      title: "Creating Game",
      status: "loading",
      description: `Name: ${nameToCreateWith}`,
    });

    try {
      const result = await createGameMutation.mutateAsync({
        name: nameToCreateWith,
      });
      if (onGameCreated) {
        await onGameCreated(result.createdGame.id);
      }
      await router.push(`/games/${result.createdGame.id}`);
      toast.update(createToast, {
        title: "Game Created",
        status: "success",
        description: `Name: ${nameToCreateWith}, ID: ${result.createdGame.id}`,
      });
      await utils.games.invalidate();
    } catch (error) {
      console.error(error);
      toast.update(createToast, {
        title: "Error",
        status: "error",
        description: `Failed to create Game (Name=${nameToCreateWith}). See console for details`,
      });
    }
    createGameDisclosure.onClose();
    setNameToCreateWith("");
  };

  const columns = useMemo<PaginatedTableProps<GameData>["columns"]>(() => {
    return [
      {
        name: "ID",
        cell: (row) => (
          <HStack justifyContent="space-between" width="100%">
            <CustomEditable
              value={row.id}
              placeholder="No ID"
              handleSave={async (nextValue) =>
                handleUpdateGame(row.id, {
                  id: nextValue,
                })
              }
              isEditable={editable}
            />
            <CopyTextButton textToCopy={row.id} />
          </HStack>
        ),
        sortable: true,
        id: columnIds.ID,
        sortField: columnIds.ID,
        minWidth: "256px",
        reorder: true,
      },
      {
        name: "Name",
        cell: (row) => (
          <CustomEditable
            value={row.name}
            placeholder="No name"
            handleSave={async (nextValue) =>
              handleUpdateGame(row.id, {
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
        reorder: true,
      },
      {
        name: "Mode",
        cell: (row) => <div data-tag="allowRowEvents">{row.mode ?? ""}</div>,
        minWidth: "128px",
        reorder: true,
      },
      {
        name: "Input Tags",
        cell: (row) => {
          return (
            <TagBadges
              selectedTags={row.inputTags
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
        reorder: true,
      },
      {
        name: "Last Updated",
        cell: (row) => row.updatedAt.toLocaleString(),
        sortable: true,
        id: columnIds.UPDATED_AT,
        sortField: columnIds.UPDATED_AT,
        minWidth: "256px",
        reorder: true,
      },
    ];
  }, [editable, tagDataById]);

  const { selectedRows, handleSelectedRowsChange, toggleCleared } =
    useSelectRows<GameData>({
      clearRowsUponChangeDependencies: [
        globalFilter.debouncedInput,
        tag,
        perPage,
        currentPage,
      ],
    });

  return (
    <Box>
      <>
        <ConfirmAlert
          isOpen={createGameDisclosure.isOpen}
          onClose={createGameDisclosure.onClose}
          handleConfirm={handleCreateConfirm}
          alertTitle="Create Game"
          confirmButtonProps={{
            colorScheme: "green",
          }}
          confirmText="Create"
        >
          {nameToCreateWith ? (
            <Text>
              Create new game with name: <Code>{nameToCreateWith}</Code>?
            </Text>
          ) : (
            <Text>Create a new untitled game?</Text>
          )}

          <Text mt="1rem">
            You can edit the game&apos;s name via its configuration page.
          </Text>
          <Text mt="1rem">
            You will be redirected to the new game&apos;s configuration page
            after clicking &apos;Create&apos;.
          </Text>
        </ConfirmAlert>
      </>
      <HStack spacing="4px" marginBottom="4px" width="100%" {...topBarProps}>
        <SearchAndCreateBar
          value={globalFilter.input}
          onChange={globalFilter.setInput}
          onCreate={allowCreate ? openCreateGameConfirmation : undefined}
          allowCreateWithEmptyValue
        />
        {additionalTopBarContent && additionalTopBarContent(selectedRows)}
      </HStack>
      <ConstrainToRemainingSpace {...constrainToRemainingSpaceProps}>
        {(remainingHeight) => {
          return (
            <PaginatedTable<GameData>
              additionalColumns={additionalColumns}
              areRowsSelectable={areRowsSelectable}
              columns={columns}
              data={data}
              fixedHeight={remainingHeight}
              itemIdField="id"
              loading={gamesQuery.isLoading}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              onSelectedRowsChange={handleSelectedRowsChange}
              onSort={handleSort}
              selectedRows={selectedRows}
              totalRows={gamesCountQuery.data?.count ?? 0}
              toggleCleared={toggleCleared}
              onRowDoubleClicked={onRowDoubleClicked}
              defaultSortFieldId={columnIds.UPDATED_AT}
              defaultSortAsc={false}
            />
          );
        }}
      </ConstrainToRemainingSpace>
    </Box>
  );
}
