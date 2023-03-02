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
      const { gameObjects, relationships } = await importGameObjects({
        file,
        parentTags,
      });
      if (onImportComplete) {
        onImportComplete({ gameObjects, relationships });
      }

      const alert = `[csvImport] ${gameObjects.successful.length} game objects created | ${gameObjects.failed.length} failed | ${relationships.successful} relationships created | ${relationships.failed} relationships failed`;
      console.info(alert);
      console.info("SUCCESS:", gameObjects.successful);
      console.info("FAILED:", gameObjects.failed);
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
