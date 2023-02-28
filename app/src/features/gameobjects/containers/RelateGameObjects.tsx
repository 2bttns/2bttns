import { Button, ButtonGroup } from "@chakra-ui/react";
import { GameObject } from "@prisma/client";
import { useEffect, useMemo } from "react";
import { api } from "../../../utils/api";

export type RelateGameObjectsProps = {
  gameObjectId1: GameObject["id"];
  gameObjectId2: GameObject["id"];
};

export default function RelateGameObjects(props: RelateGameObjectsProps) {
  const { gameObjectId1, gameObjectId2 } = props;

  const utils = api.useContext();
  const relationshipsQuery = api.gameObjects.getRelationship.useQuery({
    fromGameObjectId: gameObjectId1,
    toGameObjectId: gameObjectId2,
  });

  useEffect(() => {
    utils.gameObjects.getRelationship.invalidate({
      fromGameObjectId: gameObjectId1,
      toGameObjectId: gameObjectId2,
    });
  }, [gameObjectId1, gameObjectId2]);

  const selected = useMemo(() => {
    return relationshipsQuery.data?.relationship?.weightId ?? "NONE";
  }, [relationshipsQuery.data]);

  const upsertRelationshipMutation =
    api.gameObjects.upsertRelationship.useMutation();

  const deleteRelationshipMutation =
    api.gameObjects.deleteRelationship.useMutation();

  const handleChange: RadioGroupProps["onChange"] = async (id) => {
    if (id === "NONE") {
      await deleteRelationshipMutation.mutateAsync({
        gameObjectId1,
        gameObjectId2,
      });

      await utils.gameObjects.getRelationship.invalidate({
        fromGameObjectId: gameObjectId1,
        toGameObjectId: gameObjectId2,
      });
      return;
    }

    try {
      await upsertRelationshipMutation.mutateAsync({
        gameObjectId1,
        gameObjectId2,
        weightId: id,
      });

      await utils.gameObjects.getRelationship.invalidate({
        fromGameObjectId: gameObjectId1,
        toGameObjectId: gameObjectId2,
      });
    } catch (error) {
      console.error(error);
      window.alert("Failed to relate game objects. See console for details.");
    }
  };

  const weightsQuery = api.weights.getAll.useQuery(null);
  if (weightsQuery.isFetching) {
    return null;
  }

  if (weightsQuery.isError) {
    return <div>Failed to load weights</div>;
  }

  const options: RadioGroupProps["options"] = [
    { id: "NONE", name: "NONE" },
    ...(weightsQuery.data?.weights.map((weight) => ({
      id: weight.id,
      name: weight.name ?? "Untitled Weight",
    })) ?? []),
  ];

  if (gameObjectId1 === gameObjectId2) {
    return <>SAME</>;
  }
  return (
    <RadioGroup options={options} selected={selected} onChange={handleChange} />
  );
}

export type RadioGroupProps = {
  options: { id: string; name: string }[];
  selected: string;
  onChange: (id: string) => void;
};

function RadioGroup(props: RadioGroupProps) {
  const { options, selected, onChange } = props;

  return (
    <ButtonGroup size="sm">
      {options.map(({ id, name }) => {
        return (
          <Button
            key={id}
            variant={id === selected ? "solid" : "ghost"}
            onClick={() => {
              if (id === selected) return;
              onChange(id);
            }}
          >
            {name}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
