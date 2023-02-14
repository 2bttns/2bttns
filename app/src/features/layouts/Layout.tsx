import { Box } from "@chakra-ui/react";
import Navbar from "../navbar/Navbar";

export type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout(props: LayoutProps) {
  const { children } = props;
  return (
    <Box width="100vw" height="100vh">
      <Navbar />
      {children}
    </Box>
  );
}
