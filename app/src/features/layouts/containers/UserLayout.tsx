import { Box } from "@chakra-ui/react";
import Navbar, {
  NavbarProps,
  NAVBAR_HEIGHT_PX,
} from "../../navbar/views/Navbar";

export type UserLayoutProps = {
  children: React.ReactNode;
  navbarProps?: NavbarProps;
};

export default function UserLayout(props: UserLayoutProps) {
  const { children, navbarProps } = props;

  return (
    <Box width="100vw" height="100vh" backgroundColor="gray.300">
      <Navbar {...navbarProps} />
      <Box
        width="100vw"
        height={`calc(100vh - ${NAVBAR_HEIGHT_PX})`}
        padding="1rem"
        overflow="hidden"
      >
        {children}
      </Box>
    </Box>
  );
}
