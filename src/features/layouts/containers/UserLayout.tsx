import { Box } from "@chakra-ui/react";
import Navbar, { NavbarProps } from "../../navbar/views/Navbar";

export type UserLayoutProps = {
  children: React.ReactNode;
  navbarProps?: NavbarProps;
};

export default function UserLayout(props: UserLayoutProps) {
  const { children, navbarProps } = props;

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      backgroundColor="gray.300"
      position="relative"
    >
      <Box position="sticky" top="0" zIndex="99">
        <Navbar {...navbarProps} />
      </Box>
      <Box width="100vw" padding="1rem">
        {children}
      </Box>
    </Box>
  );
}
