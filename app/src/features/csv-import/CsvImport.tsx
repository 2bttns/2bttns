import { Input } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import useCsvImportGameObjects from "./hooks/useCsvImportGameObjects";

export type CsvImportProps = {
  parentTags?: Tag["id"][]; // Tags to assign by default to imported game objects
};

export default function CsvImport(props: CsvImportProps) {
  const { parentTags } = props;

  const { importGameObjects } = useCsvImportGameObjects();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    importGameObjects({ file, parentTags });
  };

  return (
    <>
      <Input type="file" onChange={handleFileChange} />
    </>
  );
}
