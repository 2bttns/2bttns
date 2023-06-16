import { DeleteIcon } from "@chakra-ui/icons";
import { IconButton, Tooltip, useDisclosure } from "@chakra-ui/react";
import { api } from "../../../utils/api";
import ConfirmAlert from "../../shared/components/ConfirmAlert";
import { TagData } from "./TagsTable";

export type DeleteTagButtonProps = {
  tagId: TagData["id"];
};
export default function DeleteTagButton(props: DeleteTagButtonProps) {
  const { tagId } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const utils = api.useContext();
  const deleteTagMutation = api.tags.deleteById.useMutation();
  const handleDeleteTag = async () => {
    try {
      await deleteTagMutation.mutateAsync({ id: tagId });
      await utils.tags.invalidate();
    } catch (error) {
      console.error(error);
      window.alert("Error deleting tag\n See console for details");
    }
  };

  return (
    <>
      <ConfirmAlert
        alertTitle={`Delete Tag: ${tagId}?`}
        isOpen={isOpen}
        onClose={onClose}
        handleConfirm={handleDeleteTag}
        performingConfirmActionText="Deleting..."
      >
        This action cannot be undone.
      </ConfirmAlert>
      <Tooltip label={`Delete`} placement="top">
        <IconButton
          colorScheme="red"
          onClick={onOpen}
          icon={<DeleteIcon />}
          aria-label={`Delete tag with ID: ${tagId}`}
          size="sm"
          variant="outline"
        />
      </Tooltip>
    </>
  );
}
