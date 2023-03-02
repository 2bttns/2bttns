import { Button } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { useCsvExportGameObjects } from "./hooks/useCsvExportGameObjects";

export type CsvExportProps = {
  tagsToExportBy?: Tag["id"][];
};

export default function CsvExport(props: CsvExportProps) {
  const { tagsToExportBy } = props;

  const { handleExport } = useCsvExportGameObjects({ tagsToExportBy });

  return (
    <>
      <Button variant="outline" colorScheme="blue" onClick={handleExport}>
        Export Csv
      </Button>
    </>
  );
}
