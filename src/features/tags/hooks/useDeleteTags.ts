import { Tag } from "@prisma/client";
import { api } from "../../../utils/api";

export type UseDeleteTagsConfig = {
  onDeleted?: (tagIds: Tag["id"][]) => void;
};

export default function useDeleteTags(props: UseDeleteTagsConfig = {}) {
  const { onDeleted } = props;
  const utils = api.useContext();
  const deleteTagMutation = api.tags.delete.useMutation();
  const handleDeleteTag = async (ids: Tag["id"][]) => {
    try {
      const idsString = ids.join(",");
      await deleteTagMutation.mutateAsync({ id: idsString });
      if (onDeleted) {
        onDeleted(ids);
      }
      await utils.tags.invalidate();
    } catch (error) {
      window.alert("Error deleting tag(s)\n See console for details");
      console.error(error);
    }
  };

  return { handleDeleteTag };
}
