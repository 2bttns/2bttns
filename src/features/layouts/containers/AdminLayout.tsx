import { Box, BoxProps, Divider, Stack, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import AdminNavbar from "../../navbar/containers/AdminNavbar";

export const ADMIN_SIDEBAR_WIDTH = "200px";

export type AdminLayoutProps = {
  children: React.ReactNode;
  rootBoxProps?: BoxProps;
};

export type NavMenuLink =
  | { href: string; label: string; newTab?: boolean }
  | "divider";
const links: NavMenuLink[] = [
  { href: "/", label: "Home" },
  "divider",
  { href: "/games", label: "Games" },
  { href: "/tags", label: "Tags" },
  { href: "/game-objects", label: "Game Objects" },
  "divider",
  { href: "/settings", label: "Settings" },
  { href: "/api-documentation", label: "API" },
  { href: "https://docs.2bttns.com", label: "Documentation", newTab: true },
  // { href: "/testRankedOutputs", label: "Outputs" },
];

export default function AdminLayout(props: AdminLayoutProps) {
  const { children, rootBoxProps } = props;

  const router = useRouter();

  const currentRootPage = useMemo(() => {
    return `/${router.pathname.split("/")[1]}`;
  }, [router.pathname]);

  return (
    <Box
      width="100vw"
      height="100vh"
      backgroundColor="gray.300"
      position="relative"
      overflow="hidden"
      {...rootBoxProps}
    >
      <Box position="sticky" top="0" zIndex="99">
        <AdminNavbar />
      </Box>
      <Stack width="100%" height="100%" direction="row" spacing={0}>
        <VStack
          backgroundColor="twobttns.blue"
          height="100%"
          minWidth={ADMIN_SIDEBAR_WIDTH}
          width={ADMIN_SIDEBAR_WIDTH}
          spacing={0}
          color="gray.100"
          zIndex={99}
        >
          {links.map((link, i) => {
            if (link === "divider") {
              return <Divider key={`divider-index-${i}`} />;
            }

            const isCurrentRootPage = currentRootPage === link.href;
            const target = link.newTab ? "_blank" : "_self";
            return (
              <Link
                href={link.href}
                key={link.href}
                style={{ width: "100%" }}
                target={target}
              >
                <Box
                  width="100%"
                  textAlign="left"
                  alignItems="center"
                  padding=".5rem 1rem"
                  sx={{
                    _hover: {
                      backgroundColor: "gray.200",
                      color: "gray.800",
                    },
                  }}
                  backgroundColor={isCurrentRootPage ? "gray.400" : "inherit"}
                  color={isCurrentRootPage ? "gray.800" : "inherit"}
                >
                  <Text>{link.label}</Text>
                </Box>
              </Link>
            );
          })}
        </VStack>
        <Box width={`calc(100% - ${ADMIN_SIDEBAR_WIDTH})`} height="100%">
          {children}
        </Box>
      </Stack>
    </Box>
  );
}
