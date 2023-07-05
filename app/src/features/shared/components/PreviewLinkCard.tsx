import {
  Heading,
  HStack,
  IconButton,
  IconButtonProps,
  Text,
  useMediaQuery,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";

export type PreviewLinkCardProps = {
  icon: IconButtonProps["icon"];
  title: React.ReactNode;
  description: React.ReactNode;
  link: string;
  external?: boolean;
};

export default function PreviewLinkCard(props: PreviewLinkCardProps) {
  const { icon, title, description, link, external = false } = props;

  const [isLargerThan450] = useMediaQuery("(min-width: 450px)");
  const target = external ? "_blank" : undefined;

  return (
    <HStack
      padding="1rem"
      maxWidth={{ base: "100%", md: "500px" }}
      backgroundColor="white"
      spacing="1rem"
    >
      {isLargerThan450 && (
        <Link href={link} target={target}>
          <IconButton
            icon={icon}
            aria-label="Manage Games"
            variant="outline"
            colorScheme="blue"
            size="lg"
            alignSelf="start"
          />
        </Link>
      )}
      <VStack alignItems="start" spacing={0}>
        <Link href={link} target={target}>
          <Heading size="md" color="blue.600">
            <HStack alignItems="center">
              <Text>{title}</Text>
              {external && (
                <FaExternalLinkAlt display="inline" fontSize="16px" />
              )}
            </HStack>
          </Heading>
        </Link>
        <Text color="gray.500" fontStyle="italic" whiteSpace="break-spaces">
          {description}
        </Text>
      </VStack>
    </HStack>
  );
}
