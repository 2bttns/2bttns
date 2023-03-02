import { Button } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { json2csv } from "json-2-csv";
import { api } from "../../utils/api";

export type CsvExportProps = {
  tagsToExportBy?: Tag["id"][];
};

export default function CsvExport(props: CsvExportProps) {
  const { tagsToExportBy } = props;

  const gameObjectsCount = api.gameObjects.getCount.useQuery({
    filter: tagsToExportBy
      ? {
          tag: {
            include: tagsToExportBy,
            exclude: [],
            includeUntagged: false,
          },
        }
      : undefined,
  });

  const gameObjectsQuery = api.gameObjects.getAll.useQuery(
    {
      take: gameObjectsCount.data?.count,
      filter: tagsToExportBy
        ? {
            tag: {
              include: tagsToExportBy,
              exclude: [],
              includeUntagged: false,
            },
          }
        : undefined,
      includeTags: true,
    },
    {
      enabled: false,
      onSuccess: (data) => {
        if (!data) return;
        json2csv(data.gameObjects, (err, csv) => {
          if (err || !csv) return;
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.remove();
          link.setAttribute("download", "export.csv");
          link.click();
        });
      },
    }
  );

  const handleClick = () => {
    gameObjectsQuery.refetch();
  };

  return (
    <>
      <Button variant="outline" colorScheme="blue" onClick={handleClick}>
        Export Csv
      </Button>
    </>
  );
}
