import { Box, Link as ChakraLink, Text, VStack } from "@chakra-ui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../views/Navbar";

export type AdminNavbarProps = {};

export default function AdminNavbar(props: AdminNavbarProps) {
  return (
    <Navbar
      additionalContentStart={
        <Box minWidth="48px">
          <Link href="/">
            <Image
              src="/2btnns-webgif-compressed.gif"
              alt="2bttns"
              width={48}
              height={48}
            />
          </Link>
        </Box>
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
  const router = useRouter();

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
              {session.data.user.displayName ?? session.data.user.id}
            </Text>
          </Text>
          <ChakraLink
            onClick={async () => {
              // Ignore the default redirect behavior and just reload the page
              // This prevents an issue in the Dockerized build where the user may be redirected to the internal NEXTAUTH_URL when they've mapped the port to something else
              await signOut({ redirect: false });
              router.reload();
            }}
          >
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
