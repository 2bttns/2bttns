import { Box, Link as ChakraLink, Text, VStack } from "@chakra-ui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import Navbar, { NavbarLink } from "../views/Navbar";

export type AdminNavbarProps = {};

const links: NavbarLink[] = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/game-objects", label: "Game Objects" },
  { href: "/tags", label: "Tags" },
  { href: "/settings", label: "Settings" },
  { href: "/docs", label: "Docs" },
];

export default function AdminNavbar(props: AdminNavbarProps) {
  return (
    <Navbar
      links={links}
      additionalContent={
        <>
          <AdminLoginLogout />
        </>
      }
    />
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
          <ChakraLink onClick={() => signOut({ callbackUrl: "/" })}>
            <Text>Log out</Text>
          </ChakraLink>
        </VStack>
      )}
      {!session.data && (
        <VStack spacing="-4px" alignItems="end">
          <ChakraLink onClick={() => signIn()}>
            <Text>Admin Login</Text>
          </ChakraLink>
        </VStack>
      )}
    </Box>
  );
}
