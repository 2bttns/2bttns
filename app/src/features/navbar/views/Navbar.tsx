import { Box, HStack } from "@chakra-ui/react";
import { default as NextLink } from "next/link";

export type NavbarLink = { href: string; label: string };

export type NavbarProps = {
  links?: NavbarLink[];
  additionalContentStart?: React.ReactNode;
  additionalContentEnd?: React.ReactNode;
};

export const NAVBAR_HEIGHT_PX = "64px";

export default function Navbar(props: NavbarProps) {
  const { links = [], additionalContentStart, additionalContentEnd } = props;

  return (
    <HStack
      width="100%"
      height={NAVBAR_HEIGHT_PX}
      paddingX="1rem"
      backgroundColor="twobttns.darkblue"
      color="gray.200"
      justifyContent="space-between"
    >
      <HStack spacing="1rem">
        {additionalContentStart && <Box>{additionalContentStart}</Box>}
        {links.map((link) => (
          <NextLink href={link.href} key={link.href}>
            <Box key={link.href}>{link.label}</Box>
          </NextLink>
        ))}
      </HStack>
      {additionalContentEnd && <Box>{additionalContentEnd}</Box>}
    </HStack>
  );
}
