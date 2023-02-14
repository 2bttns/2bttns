import { Button, Input } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { useRef } from "react";
import useCsvImportGameObjects, {
  ImportResult,
} from "./hooks/useCsvImportGameObjects";

export type CsvImportProps = {
  parentTags?: Tag["id"][]; // Tags to assign by default to imported game objects
  onImportComplete?: (importResult: ImportResult) => void;
};

export default function CsvImport(props: CsvImportProps) {
  const { parentTags, onImportComplete } = props;

  const { importGameObjects } = useCsvImportGameObjects();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const { created, failed } = await importGameObjects({ file, parentTags });
      if (onImportComplete) {
        onImportComplete({ created, failed });
      }

      const alert = `[csvImport] ${created.length} game objects created. ${failed.length} failed.`;
      console.info(alert);
      console.info("CREATED:", created);
      console.info("FAILED:", failed);
      if (typeof window === "undefined") return;
      window.alert(`${alert} See console for details.`);
    } catch (error) {
      if (typeof window === "undefined") return;
      const alert = "Failed to import game objects.";
      console.info(alert);
      console.error(error);
      window.alert(`${alert} See console for details.`);
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <Input
        type="file"
        onChange={handleFileChange}
        sx={{ paddingTop: "4px", display: "none" }}
        ref={inputRef}
        accept=".csv"
      />
      <Button
        variant="outline"
        colorScheme="blue"
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.click();
          }
        }}
      >
        Import CSV
      </Button>
    </>
  );
}
