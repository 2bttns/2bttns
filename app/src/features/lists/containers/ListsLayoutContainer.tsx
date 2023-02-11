import { api } from "../../../utils/api";
import ListsLayout, { ListsLayoutProps } from "../views/ListsLayout";

export type ListsLayoutContainerProps = {
  children: ListsLayoutProps["children"];

  breadcrumbs?: ListsLayoutProps["breadcrumbs"];
  createListsButtonProps?: ListsLayoutProps["createListsButtonProps"];
  subtitle?: ListsLayoutProps["subtitle"];
};

export default function ListsLayoutContainer(props: ListsLayoutContainerProps) {
  const { children, breadcrumbs, subtitle, createListsButtonProps } = props;
  const listsQuery = api.lists.getAll.useQuery();

  const handleSelectList: ListsLayoutProps["handleSelectList"] = (list) => {
    console.log("handleSelectList", list);
  };

  return (
    <ListsLayout
      children={children}
      breadcrumbs={breadcrumbs}
      createListsButtonProps={createListsButtonProps}
      handleSelectList={handleSelectList}
      lists={listsQuery.data?.lists ?? []}
      listsError={listsQuery.error}
      listsLoading={listsQuery.isLoading}
      subtitle={subtitle}
    />
  );
}
