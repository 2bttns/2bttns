import { Box, HStack, StackProps, useToast } from "@chakra-ui/react";
import { useMemo } from "react";
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

export type SecretData = RouterOutputs["secrets"]["getAll"]["secrets"][0];

export type AdministratorsTableProps = {
  onAdminCreated?: (secret: SecretData) => Promise<void>;
  additionalColumns?: PaginatedTableProps<SecretData>["additionalColumns"];
  additionalTopBarContent?: (selectedRows: SecretData[]) => React.ReactNode;
  editable?: boolean;
  constrainToRemainingSpaceProps?: Partial<ConstrainToRemainingSpaceProps>;
  topBarProps?: Partial<StackProps>;
  areRowsSelectable?: boolean;
};

export default function AdministratorsTable(props: AdministratorsTableProps) {
  const {
    additionalColumns,
    additionalTopBarContent,
    areRowsSelectable = true,
    constrainToRemainingSpaceProps,
    editable = true,
    onAdminCreated: onSecretCreated,
    topBarProps,
  } = props;

  const toast = useToast();

  const { perPage, currentPage, handlePageChange, handlePerRowsChange } =
    usePagination();
  const { getSortOrder: getSort, handleSort } = useSort<SecretData>();

  const utils = api.useContext();
  const globalFilter = useDebouncedValue();

  const secretsQuery = api.secrets.getAll.useQuery(
    {
      skip: (currentPage! - 1) * perPage,
      take: perPage,
      filter: globalFilter.debouncedInput
        ? {
            mode: "OR",
            id: { contains: globalFilter.debouncedInput },
            name: { contains: globalFilter.debouncedInput },
          }
        : undefined,
      sort: {
        id: getSort("id"),
        name: getSort("name"),
        description: getSort("description"),
        secret: getSort("secret"),
        updatedAt: getSort("updatedAt"),
      },
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );
  const data: SecretData[] = secretsQuery.data?.secrets ?? [];

  const secretsCountQuery = api.secrets.getCount.useQuery(
    {
      filter: globalFilter.debouncedInput
        ? {
            mode: "OR",
            id: { contains: globalFilter.debouncedInput },
            name: { contains: globalFilter.debouncedInput },
          }
        : undefined,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const updateSecretMutation = api.secrets.updateById.useMutation();
  const handleUpdateSecret = async (
    id: string,
    data: RouterInputs["secrets"]["updateById"]["data"]
  ) => {
    const updateDescription = `ID=${id}`;
    const updateToast = toast({
      title: "Updating GameObject",
      description: updateDescription,
      status: "loading",
    });
    try {
      await updateSecretMutation.mutateAsync({ id, data });
      await utils.secrets.invalidate();
      toast.update(updateToast, {
        title: "Success: Secret Updated",
        description: updateDescription,
        status: "success",
      });
    } catch (error) {
      toast.update(updateToast, {
        title: "Error",
        description: `Failed to update Secret (ID=${id}). See console for details`,
        status: "error",
      });
      // This will be caught by CustomEditable component using this function
      // it will revert the value to the previous value when it receives an error
      throw error;
    }
  };

  const createSecretsMutation = api.secrets.create.useMutation();
  const handleCreateSecret = async (name: string) => {
    const createDescription = `Name=${name}`;
    const createToast = toast({
      title: "Creating Tag",
      description: createDescription,
      status: "loading",
    });
    try {
      const result = await createSecretsMutation.mutateAsync({ name });
      if (onSecretCreated) await onSecretCreated(result.createdSecret);
      await utils.secrets.invalidate();
      toast.update(createToast, {
        title: "Success: Tag Created",
        description: createDescription,
        status: "success",
      });
    } catch (error) {
      console.error(error);
      toast.update(createToast, {
        title: "Error",
        description: `Failed to create Tag (Name=${name}). See console for details`,
        status: "error",
      });
    }
  };

  const columns = useMemo<PaginatedTableProps<SecretData>["columns"]>(() => {
    return [
      {
        name: "ID",
        cell: (row) => (
          <CustomEditable
            value={row.id}
            placeholder="No ID"
            handleSave={async (nextValue) =>
              handleUpdateSecret(row.id, {
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
            value={row.name ?? undefined}
            placeholder="No name"
            handleSave={async (nextValue) =>
              handleUpdateSecret(row.id, {
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
              handleUpdateSecret(row.id, {
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
        name: "Secret",
        cell: (row) => row.secret ?? "",
        minWidth: "256px",
        sortable: true,
        sortField: "secret",
      },
      {
        name: "Last Updated",
        cell: (row) => row.updatedAt.toLocaleString(),
        sortable: true,
        sortField: "updatedAt",
        minWidth: "256px",
      },
    ];
  }, [editable]);

  const { selectedRows, handleSelectedRowsChange, toggleCleared } =
    useSelectRows<SecretData>({
      clearRowsUponChangeDependencies: [
        globalFilter.debouncedInput,
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
          onCreate={(name) => handleCreateSecret(name)}
        />
        {additionalTopBarContent && additionalTopBarContent(selectedRows)}
      </HStack>
      <ConstrainToRemainingSpace {...constrainToRemainingSpaceProps}>
        {(remainingHeight) => {
          return (
            <PaginatedTable<SecretData>
              additionalColumns={additionalColumns}
              areRowsSelectable={areRowsSelectable}
              columns={columns}
              data={data}
              fixedHeight={remainingHeight}
              itemIdField="id"
              loading={secretsQuery.isLoading}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              onSelectedRowsChange={handleSelectedRowsChange}
              onSort={handleSort}
              selectedRows={selectedRows}
              totalRows={secretsCountQuery.data?.count ?? 0}
              toggleCleared={toggleCleared}
            />
          );
        }}
      </ConstrainToRemainingSpace>
    </Box>
  );
}
