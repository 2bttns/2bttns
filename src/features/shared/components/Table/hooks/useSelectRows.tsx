import { useEffect, useState } from "react";
import { PaginatedTableProps } from "../containers/PaginatedTable";

export type UseSelectRowsProps<T> = {
  clearRowsUponChangeDependencies?: any[];
};

export default function useSelectRows<T extends Object>(
  props: UseSelectRowsProps<T> = {}
) {
  const { clearRowsUponChangeDependencies = [] } = props;
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const handleSelectedRowsChange: PaginatedTableProps<T>["onSelectedRowsChange"] =
    (selected) => {
      setSelectedRows(selected.selectedRows);
    };

  // State that should be passed to PaginatedTable to clear the selected rows UI
  // For some reason, the selected rows UI doesn't clear when the selected row state change
  // TODO: Improve PaginatedTable by changing to another library like react-table for more control
  const [toggleCleared, setToggleCleared] = useState(false);

  // Clear the selected rows state when the dependencies change
  // e.g. clear state whenever search value or filters change
  useEffect(() => {
    if (clearRowsUponChangeDependencies.length === 0) return;
    setSelectedRows([]);
    setToggleCleared((prev) => !prev);
  }, clearRowsUponChangeDependencies);

  return {
    selectedRows,
    setSelectedRows,
    handleSelectedRowsChange,
    toggleCleared,
  };
}
