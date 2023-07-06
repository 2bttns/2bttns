import { SettingsIcon } from "@chakra-ui/icons";
import { IconButton, Tooltip } from "@chakra-ui/react";
import { Game } from "@prisma/client";
import { useRouter } from "next/router";

export type ManageGameButtonProps = {
  gameId: Game["id"];
};

export default function ManageGameButton(props: ManageGameButtonProps) {
  const { gameId } = props;

  const router = useRouter();
  const handleManageGameRedirect = () => {
    router.push(`/games/${gameId}`);
  };

  return (
    <Tooltip label={`Manage`} placement="top">
      <IconButton
        colorScheme="blue"
        onClick={handleManageGameRedirect}
        icon={<SettingsIcon />}
        aria-label={`Manage game with ID=${gameId}`}
        size="sm"
        variant="outline"
      />
    </Tooltip>
  );
}
