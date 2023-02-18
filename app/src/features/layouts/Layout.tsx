import { Box } from "@chakra-ui/react";
import AdminNavbar from "../navbar/containers/AdminNavbar";
import { NAVBAR_HEIGHT_PX } from "../navbar/views/Navbar";

export type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout(props: LayoutProps) {
  const { children } = props;

  return (
    <Box width="100vw" height="100vh" backgroundColor="gray.300">
      <AdminNavbar />
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
