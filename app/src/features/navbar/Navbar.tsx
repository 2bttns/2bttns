import { Box, HStack } from "@chakra-ui/react";
import NextLink from "next/link";

export type Navbar = {};

export const NAVBAR_HEIGHT_PX = "64px";

const links = [
  { href: "/", label: "Home" },
  { href: "/game-objects", label: "Game Objects" },
  { href: "/games", label: "Games" },
];

export default function Navbar(props: Navbar) {
  const {} = props;

  return (
    <HStack width="100%" height={NAVBAR_HEIGHT_PX} paddingX="1rem">
      {links.map((link) => (
        <NextLink href={link.href} key={link.href}>
          <Box key={link.href}>{link.label}</Box>
        </NextLink>
      ))}
    </HStack>
  );
}
