import { DeleteIcon } from "@chakra-ui/icons";
import { IconButton, Tooltip } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { api } from "../../../utils/api";
import { TagData } from "./TagsTable";

export type DeleteTagButtonProps = {
  tagId: TagData["id"];
};
export default function DeleteTagButton(props: DeleteTagButtonProps) {
  const { tagId } = props;

  const utils = api.useContext();
  const deleteTagMutation = api.tags.deleteById.useMutation();
  const handleDeleteTag = async (id: Tag["id"]) => {
    try {
      await deleteTagMutation.mutateAsync({ id });
      await utils.tags.invalidate();
    } catch (error) {
      console.error(error);
      window.alert("Error deleting tag\n See console for details");
    }
  };

  return (
    <Tooltip label={`Delete`} placement="top">
      <IconButton
        colorScheme="red"
        onClick={() => {
          handleDeleteTag(tagId);
        }}
        icon={<DeleteIcon />}
        aria-label={`Delete tag with ID: ${tagId}`}
        size="sm"
        variant="outline"
      />
    </Tooltip>
  );
}
