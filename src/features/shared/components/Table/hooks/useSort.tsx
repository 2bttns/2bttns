///
/// usePagination.tsx
///

import { useState } from "react";
import { PaginatedTableProps } from "../containers/PaginatedTable";

/**
 * Re-usable sort hook for use by the custom PaginatedTable component
 * Only supports sorting by a single column at a time; does not support multi-column sorting (for now)
 */
export default function useSort<T extends Object = any>() {
  const [sorting, setSorting] = useState<{
    sortField: keyof T;
    order: "asc" | "desc";
  } | null>(null);

  /**
   * handleSort method that should be supplied to the PaginatedTable's `onSort` prop
   */
  const handleSort: PaginatedTableProps<T>["onSort"] = (
    column,
    sortDirection
  ) => {
    setSorting({
      sortField: column.sortField as keyof T,
      order: sortDirection,
    });
  };

  /**
   * Get the sort order of a given column
   * @param sortField sort field to check
   * @returns Sort order of the given column, or `undefined` if the column is not the current sorting column
   */
  const getSortOrder = (sortField: keyof T) => {
    if (!sorting) return undefined;
    if (sorting.sortField !== sortField) return undefined;
    return sorting.order;
  };

  return {
    handleSort,
    sorting,
    getSortOrder,
  };
}
