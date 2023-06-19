import { useToast } from "@chakra-ui/react";
import { Tag } from "@prisma/client";
import { api } from "../../../utils/api";

export type UseDeleteTagsConfig = {
  onDeleted?: (tagIds: Tag["id"][]) => void;
};

export default function useDeleteTags(props: UseDeleteTagsConfig = {}) {
  const { onDeleted } = props;
  const utils = api.useContext();
  const toast = useToast();
  const deleteTagMutation = api.tags.delete.useMutation();
  const handleDeleteTag = async (ids: Tag["id"][]) => {
    const deleteToast = toast({
      title: `Deleting ${ids.length} tag(s)`,
      status: "loading",
    });
    try {
      const idsString = ids.join(",");
      await deleteTagMutation.mutateAsync({ id: idsString });
      if (onDeleted) {
        onDeleted(ids);
      }
      await utils.tags.invalidate();
      toast.update(deleteToast, {
        title: `Success: Deleted ${ids.length} tag(s)`,
        status: "success",
      });
    } catch (error) {
      console.error(error);
      toast.update(deleteToast, {
        title: `Error`,
        description: `Received an unexpected error when deleting ${ids.length} tag(s). See console for details.`,
        status: "error",
      });
    }
  };

  return { handleDeleteTag };
}
