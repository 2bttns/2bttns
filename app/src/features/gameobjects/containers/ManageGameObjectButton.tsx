import { SettingsIcon } from "@chakra-ui/icons";
import { IconButton, Tooltip } from "@chakra-ui/react";
import NextLink from "next/link";
import { GameObjectData } from "./GameObjectsTable";

export type ManageGameObjectButtonProps = {
  gameObjectId: GameObjectData["id"];
};

export default function ManageGameObjectButton(
  props: ManageGameObjectButtonProps
) {
  const { gameObjectId } = props;

  const href = `/game-objects/${gameObjectId}`;

  return (
    <Tooltip label="Manage" placement="top">
      <NextLink href={href}>
        <IconButton
          colorScheme="blue"
          icon={<SettingsIcon />}
          aria-label={`Manage gameobject with ID: ${gameObjectId}`}
          size="sm"
          variant="solid"
        />
      </NextLink>
    </Tooltip>
  );
}
