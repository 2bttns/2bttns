import { Box, Link as ChakraLink, Text, VStack } from "@chakra-ui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../views/Navbar";

export type AdminNavbarProps = {};

export default function AdminNavbar(props: AdminNavbarProps) {
  return (
    <Navbar
      additionalContentStart={
        <Link href="/">
          <Image
            src="/2btnns-webgif-compressed.gif"
            alt="2bttns"
            width={48}
            height={48}
          />
        </Link>
      }
      additionalContentEnd={
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
