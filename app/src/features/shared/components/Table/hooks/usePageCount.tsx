import { PaginationState } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useEffect } from "react";

export type UsePageCountParams = {
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  itemCount: number;
};

export default function usePageCount(params: UsePageCountParams) {
  const {
    pagination: { pageIndex, pageSize },
    setPagination,
    itemCount,
  } = params;

  const pageCount = Math.ceil(itemCount / pageSize);

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

  return {
    pageCount,
  };
}
