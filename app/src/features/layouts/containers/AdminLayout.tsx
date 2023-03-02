import { Box } from "@chakra-ui/react";
import AdminNavbar from "../../navbar/containers/AdminNavbar";

export type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout(props: AdminLayoutProps) {
  const { children } = props;

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      backgroundColor="gray.300"
      position="relative"
    >
      <Box position="sticky" top="0" zIndex="99">
        <AdminNavbar />
      </Box>
      <Box width="100vw" padding="1rem">
        {children}
      </Box>
    </Box>
  );
}
