import { Box } from "@chakra-ui/react";
import Navbar, { NavbarProps } from "../../navbar/views/Navbar";

export type PlayerLayoutProps = {
  children: React.ReactNode;
  showNavbar?: boolean;
  navbarProps?: NavbarProps;
};

export default function PlayerLayout(props: PlayerLayoutProps) {
  const { children, showNavbar = false, navbarProps } = props;

  return (
    <Box
      width="100vw"
      height="100vh"
      backgroundColor="gray.300"
      position="relative"
      overflow="hidden"
    >
      <Box position="sticky" top="0" zIndex="99">
        {showNavbar && <Navbar {...navbarProps} />}
      </Box>
      <Box width="100%" height="100%">
        {children}
      </Box>
    </Box>
  );
}
