///
/// usePagination.tsx
/// -----------------
/// Re-usable pagination hook for use by the custom PaginatedTable component
///

import { useState } from "react";
import { PaginatedTableProps } from "../containers/PaginatedTable";

export type UsePaginationParams = {
  initialPerPage?: number;
  initialPage?: number;
};

export default function usePagination(params?: UsePaginationParams) {
  const initialPerPage = params?.initialPerPage ?? 10;
  const initialPage = params?.initialPage ?? 1;

  const [perPage, setPerPage] = useState(initialPerPage);
  const [currentPage, setCurrentPage] = useState<number | null>(
    initialPage !== undefined ? initialPage : null
  );
  const handlePageChange: PaginatedTableProps<any>["onChangePage"] = (page) => {
    setCurrentPage(page);
  };
  const handlePerRowsChange: PaginatedTableProps<any>["onChangeRowsPerPage"] =
    async (newPerPage, page) => {
      setCurrentPage(page);
      setPerPage(newPerPage);
    };

  return {
    perPage,
    currentPage,
    handlePageChange,
    handlePerRowsChange,
  };
}
