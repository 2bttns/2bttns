import { Button } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { api } from "../../utils/api";

export type CsvExportProps = {
  tagsToExportBy?: Tag["id"][];
};

export default function CsvExport(props: CsvExportProps) {
  const { tagsToExportBy } = props;

  const gameObjectsCount = api.gameObjects.getCount.useQuery({
    filter: tagsToExportBy
      ? {
          tag: { include: tagsToExportBy, exclude: [], includeUntagged: false },
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
      enabled: !!gameObjectsCount.data,
    }
  );

  const exportCsv = () => {
    console.log("export", tagsToExportBy);
    console.log(gameObjectsQuery.data?.gameObjects);
  };

  const handleClick = () => {
    exportCsv();
  };

  return (
    <>
      <Button variant="outline" colorScheme="blue" onClick={handleClick}>
        Export Csv
      </Button>
    </>
  );
}
