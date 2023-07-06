import { Box } from "@chakra-ui/react";
import Navbar, { NavbarProps } from "../../navbar/views/Navbar";

export type PlayerLayoutProps = {
  children: React.ReactNode;
  navbarProps?: NavbarProps;
};

export default function PlayerLayout(props: PlayerLayoutProps) {
  const { children, navbarProps } = props;

  return (
    <Box
      width="100vw"
      height="100vh"
      backgroundColor="gray.300"
      position="relative"
      overflow="hidden"
    >
      <Box position="sticky" top="0" zIndex="99">
        <Navbar {...navbarProps} />
      </Box>
      <Box width="100%" height="100%">
        {children}
      </Box>
    </Box>
  );
}
