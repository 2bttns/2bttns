import { Box, Link, Text, VStack } from "@chakra-ui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import Navbar, { NAVBAR_HEIGHT_PX } from "../navbar/Navbar";

export type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout(props: LayoutProps) {
  const { children } = props;

  return (
    <Box width="100vw" height="100vh" backgroundColor="gray.300">
      <Navbar additionalContent={<AdminLoginLogout />} />
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

function AdminLoginLogout() {
  const session = useSession();

  if (session.status === "loading") {
    return null;
  }

  return (
    <Box>
      {session.data && (
        <VStack spacing="-4px" alignItems="end">
          <Text fontStyle="italic">
            Logged in as Admin:{" "}
            <Text as="span" display="inline" fontWeight="bold">
              {session.data.user?.email ?? "MISSING_EMAIL"}
            </Text>
          </Text>
          <Link onClick={() => signOut({ callbackUrl: "/" })}>
            <Text>Log out</Text>
          </Link>
        </VStack>
      )}
      {!session.data && (
        <VStack spacing="-4px" alignItems="end">
          <Link onClick={() => signIn()}>
            <Text>Admin Login</Text>
          </Link>
        </VStack>
      )}
    </Box>
  );
}
