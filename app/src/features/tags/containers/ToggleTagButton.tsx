import { LinkIcon } from "@chakra-ui/icons";
import { IconButton, Tooltip } from "@chakra-ui/react";
import { GameObject, Tag } from "@prisma/client";
import { api } from "../../../utils/api";

export type ToggleTagButtonProps = {
  tagId: Tag["id"];
  gameObjectId: GameObject["id"];
};

export default function ToggleTagButton(props: ToggleTagButtonProps) {
  const { tagId, gameObjectId } = props;

  const utils = api.useContext();
  const getGameObjectQuery = api.gameObjects.getById.useQuery({
    id: gameObjectId,
    includeTags: true,
  });
  const isTagApplied = getGameObjectQuery.data?.gameObject?.tags.some(
    (tag) => tag.id === tagId
  );

  const updateTagMutation = api.tags.updateById.useMutation();
  const handleApplyTag = async () => {
    try {
      await updateTagMutation.mutateAsync({
        id: tagId,
        data: {
          addGameObjects: isTagApplied ? undefined : [gameObjectId],
          removeGameObjects: isTagApplied ? [gameObjectId] : undefined,
        },
      });
      await utils.gameObjects.invalidate();
    } catch (error) {
      window.alert("Error deleting game object\n See console for details");
      console.error(error);
    }
  };

  const label = isTagApplied ? "Remove tag" : "Apply tag";

  return (
    <Tooltip label={label} placement="top">
      <IconButton
        colorScheme={isTagApplied ? "red" : "green"}
        onClick={handleApplyTag}
        icon={<LinkIcon />}
        aria-label={`${label} for gameobject with ID: ${tagId}`}
        size="sm"
        variant="outline"
      />
    </Tooltip>
  );
}
