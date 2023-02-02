import { ListItem } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "../../../utils/api";
import { ListItemField } from "../components/ListItemsTable";
import List, { ListProps } from "../views/List";
import ListsLayoutContainer from "./ListsLayoutContainer";

export type ListsContainerProps = {};

export default function ListsContainer(props: ListsContainerProps) {
  const router = useRouter();
  const { listId } = router.query as { listId: string };

  const redirectInvalidList = () => {
    router.push("/404");
  };

  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [fields, setFields] = useState<ListItemField[]>([]);

  const apiUtils = api.useContext();

  const listQuery = api.lists.getById.useQuery(
    { id: listId, includeListItems: true },
    {
      enabled: listId !== undefined,
      retry: false,
      onError: (error) => {
        console.error(error);
        redirectInvalidList();
      },
      onSuccess: (result) => {
        setListItems(result.list.ListItem);
        const fields =
          result.list.ListItem && result.list.ListItem.length > 0
            ? (Object.keys(result.list.ListItem[0]!) as ListItemField[])
            : [];
        setFields(fields);
      },
    }
  );

  const handleAddField: ListProps["handleAddField"] = (field) => {
    setFields([...fields, field] as ListItemField[]);
    setListItems(
      listItems.map((item) => {
        return { ...item, [field]: "" };
      })
    );
  };

  // TODO: Create list item mutation

  const { mutate: addNewListItemMutation } = useMutation({
    mutationFn: async (params: AddListItemParams) => {
      const response = await addListItems(params);
      return response;
    },
  });

  const handleAddListItem: ListByIdViewProps["handleAddListItem"] = () => {
    // Adds a new empty list item to the list
    // The user will be able to edit the list item's fields directly via the ListItemsTable component
    addNewListItemMutation({
      listId,
      listItems: [{ name: "" }],
    });
    queryClient.invalidateQueries(["lists", listId]);
  };

  const { mutate: deleteListMutation } = useMutation(
    async (listId: string) => {
      const result = await deleteList({
        list_id: listId,
      });
      return result;
    },
    {
      onSuccess: (result) => {
        window.alert("List deleted successfully");
      },
      onError: (error) => {
        console.error(error);
      },
    }
  );

  const handleDeleteList: ListByIdViewProps["handleDeleteList"] = (listId) => {
    if (typeof window === "undefined") return;
    const confirm = window.confirm(
      "Please confirm that you want to delete this list. This action cannot be undone."
    );
    if (!confirm) return;
    router.push("/lists");
    deleteListMutation(listId);
  };

  const breadcrumbLabel = list
    ? `${list.name || DEFAULT_LIST_NAME} (${list.id})`
    : "";

  const { mutate: updateListMutation } = useMutation(
    async (body: UpdateListParams["body"]) => {
      const result = await updateList({
        list_id: listId,
        body,
      });
      return result;
    },
    {
      onSuccess: (result) => {
        queryClient.invalidateQueries(["lists", listId]);
        queryClient.invalidateQueries(["lists"]);
      },
      onError: (error) => {
        console.error(error);
      },
    }
  );

  const handleListMetadataEdit: ListByIdViewProps["handleListMetadataEdit"] = (
    field,
    value
  ) => {
    updateListMutation({
      [field]: value,
    });
  };

  const { mutate: updateListItemsMutation } = useMutation({
    mutationFn: async (params: UpdateListItemsParams) => {
      const response = await updateListItems(params);
      return response;
    },
  });

  const handleEditListItem: ListByIdViewProps["handleEditListItem"] = (
    listItem,
    field,
    value
  ) => {
    updateListItemsMutation({
      list_id: listItem.list_id,
      list_item_ids: [listItem.id],
      body: {
        [field]: value,
      },
    });
  };

  const { mutate: deleteListItemsMutation } = useMutation({
    mutationFn: async (params: DeleteListItemsParams) => {
      const response = await deleteListItems(params);
      return response;
    },
  });

  const handleDeleteListItem: ListByIdViewProps["handleDeleteListItem"] = (
    listItem
  ) => {
    deleteListItemsMutation({
      list_id: listItem.list_id,
      list_item_ids: [listItem.id],
    });
    queryClient.invalidateQueries(["lists", listId]);
    queryClient.invalidateQueries(["lists"]);
    queryClient.refetchQueries(["lists"]);
  };

  return (
    <ListsLayoutContainer
      subtitle={list?.name || "Untitled List"}
      breadcrumbs={[{ label: breadcrumbLabel, href: "#" }]}
    >
      {isListLoading || listError || !list ? (
        <>
          {isListLoading && <Text>Loading list...</Text>}
          {!isListLoading && listError && <Text>Failed to load list.</Text>}
        </>
      ) : (
        <List
          list={list!}
          isListLoading={isListLoading}
          listError={listError as Error | undefined}
          listItems={listItems}
          fields={fields}
          handleAddListItem={handleAddListItem}
          handleAddField={handleAddField}
          handleEditListItem={handleEditListItem}
          handleDeleteListItem={handleDeleteListItem}
          handleDeleteList={handleDeleteList}
          handleListMetadataEdit={handleListMetadataEdit}
          breadcrumbLabel={breadcrumbLabel}
        />
      )}
    </ListsLayoutContainer>
  );
}
