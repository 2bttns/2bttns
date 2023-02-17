import { Box, HStack } from "@chakra-ui/react";
import NextLink from "next/link";

export type Navbar = {
  additionalContent?: React.ReactNode;
};

export const NAVBAR_HEIGHT_PX = "64px";

const links = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/game-objects", label: "Game Objects" },
  { href: "/tags", label: "Tags" },
  { href: "/settings", label: "Settings" },
  { href: "/docs", label: "Docs" },
];

export default function Navbar(props: Navbar) {
  const { additionalContent } = props;

  return (
    <HStack
      width="100%"
      height={NAVBAR_HEIGHT_PX}
      paddingX="1rem"
      backgroundColor="blue.900"
      color="gray.200"
      justifyContent="space-between"
    >
      <HStack spacing="1rem">
        {links.map((link) => (
          <NextLink href={link.href} key={link.href}>
            <Box key={link.href}>{link.label}</Box>
          </NextLink>
        ))}
      </HStack>
      <Box>{additionalContent}</Box>
    </HStack>
  );
}
