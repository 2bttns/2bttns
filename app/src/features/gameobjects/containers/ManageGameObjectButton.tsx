import { SettingsIcon } from "@chakra-ui/icons";
import { IconButton, Tooltip } from "@chakra-ui/react";
import NextLink from "next/link";
import { GameObjectData } from "./GameObjectsTable";

export type ManageGameObjectButtonProps = {
  gameObjectId: GameObjectData["id"];
  gameObjectName?: GameObjectData["name"];
};

export default function ManageGameObjectButton(
  props: ManageGameObjectButtonProps
) {
  const { gameObjectId, gameObjectName } = props;

  const href = `/game-objects/${gameObjectId}`;

  return (
    <Tooltip
      label={`Manage${
        gameObjectName ? ` "${gameObjectName}"` : ` Game Object`
      }`}
      placement="top"
    >
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
