import { DeleteIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { api } from "../../../utils/api";
import ConfirmAlert from "../../shared/components/ConfirmAlert";
import { TagData } from "./TagsTable";

export type DeleteTagButtonProps = {
  tagId: TagData["id"];
};
export default function DeleteTagButton(props: DeleteTagButtonProps) {
  const { tagId } = props;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const utils = api.useContext();
  const tagQuery = api.tags.getById.useQuery({ id: tagId });
  const deleteTagMutation = api.tags.deleteById.useMutation();

  const tagName = tagQuery.data?.tag.name ?? "Untitled Tag";
  const handleDeleteTag = async () => {
    const deleteDescription = `${tagName} (ID=${tagId})`;
    const deleteToast = toast({
      title: `Deleting Tag...`,
      description: deleteDescription,
      status: "loading",
    });
    onClose(); // Close the confirm alert; loading toast will notifiy the user of success/error

    try {
      await deleteTagMutation.mutateAsync({ id: tagId });
      await utils.tags.invalidate();
      toast.update(deleteToast, {
        title: `Success: Deleted Tag`,
        description: deleteDescription,
        status: "success",
      });
    } catch (error) {
      console.error(error);
      toast.update(deleteToast, {
        title: `Error`,
        description: `Received an unexpected error when deleting a tag. See console for details.`,
        status: "error",
      });
    }
  };

  return (
    <>
      <ConfirmAlert
        alertTitle={`Delete Tag?`}
        isOpen={isOpen}
        onClose={onClose}
        handleConfirm={handleDeleteTag}
        performingConfirmActionText="Deleting..."
      >
        <Text>Click &apos;Confirm&apos; to delete the following tag:</Text>
        <Text textDecoration="underline">
          {tagName} (ID={tagId})
        </Text>
        <Text mt="1rem" color="red.500" fontStyle="italic">
          Warning: This action cannot be undone.
        </Text>
      </ConfirmAlert>
      <Tooltip label={`Delete`} placement="top">
        <IconButton
          colorScheme="red"
          onClick={onOpen}
          icon={<DeleteIcon />}
          aria-label={`Delete tag with ID=${tagId}`}
          size="sm"
          variant="outline"
        />
      </Tooltip>
    </>
  );
}
