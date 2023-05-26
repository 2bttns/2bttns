import { SettingsIcon } from "@chakra-ui/icons";
import { IconButton, Tooltip } from "@chakra-ui/react";
import Link from "next/link";
import { TagData } from "./TagsTable";

export type ManageTagButtonProps = {
  tagId: TagData["id"];
};
export default function ManageTagButton(props: ManageTagButtonProps) {
  const { tagId } = props;

  return (
    <Tooltip label={`Manage Tag`} placement="top">
      <Link href={`/tags/${tagId}`}>
        <IconButton
          colorScheme="blue"
          icon={<SettingsIcon />}
          aria-label={`Manage tag with ID: ${tagId}`}
          size="sm"
          variant="solid"
        />
      </Link>
    </Tooltip>
  );
}
