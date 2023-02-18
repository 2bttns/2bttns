import { Box, HStack } from "@chakra-ui/react";
import NextLink from "next/link";

export type NavbarLink = { href: string; label: string };

export type NavbarProps = {
  links: NavbarLink[];
  additionalContent?: React.ReactNode;
};

export const NAVBAR_HEIGHT_PX = "64px";

export default function Navbar(props: NavbarProps) {
  const { links, additionalContent } = props;

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
