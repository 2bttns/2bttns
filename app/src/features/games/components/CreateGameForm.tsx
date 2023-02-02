import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Game } from "@prisma/client";
import { useState } from "react";

export type CreateGameFormProps = {
  onSubmit: (values: CreateGameFormValues) => void;
};

export type CreateGameFormValues = {
  name: Game["name"];
  description: Game["description"];
  plugins: Game["plugins"];
};

export default function CreateGameForm(props: CreateGameFormProps) {
  const { onSubmit } = props;

  const [name, setName] = useState<CreateGameFormValues["name"]>("");
  const [description, setDescription] =
    useState<CreateGameFormValues["description"]>(null);
  const [plugins, setPlugins] = useState<CreateGameFormValues["plugins"]>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name || !description || !plugins) {
      setErrorMessage("All fields are required");
      return;
    }
    setErrorMessage("");

    onSubmit({ description, name, plugins });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormControl>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="description">Description</FormLabel>
        <Textarea
          id="description"
          value={description ?? ""}
          onChange={(event) => setDescription(event.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="plugins">Plugins (comma-separated list)</FormLabel>
        <Input
          id="plugins"
          type="text"
          value={plugins ?? ""}
          onChange={(event) => setPlugins(event.target.value)}
        />
      </FormControl>

      {errorMessage && <Text color="red.500">{errorMessage}</Text>}
      <Box sx={{ paddingY: "1rem" }}>
        <Button
          sx={{ width: "100%" }}
          colorScheme="blue"
          size="lg"
          type="submit"
        >
          Create Game
        </Button>
      </Box>
    </form>
  );
}
