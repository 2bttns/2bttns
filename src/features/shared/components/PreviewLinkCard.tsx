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

export type PreviewLinkCardProps = {
  icon: IconButtonProps["icon"];
  title: React.ReactNode;
  description: React.ReactNode;
  link: string;
};

export default function PreviewLinkCard(props: PreviewLinkCardProps) {
  const { icon, title, description, link } = props;

  const [isLargerThan450] = useMediaQuery("(min-width: 450px)");

  return (
    <HStack
      padding="1rem"
      maxWidth={{ base: "100%", md: "500px" }}
      backgroundColor="white"
      spacing="1rem"
    >
      {isLargerThan450 && (
        <Link href={link}>
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
        <Link href={link}>
          <Heading size="md" color="blue.600">
            {title}
          </Heading>
        </Link>
        <Text color="gray.500" fontStyle="italic" whiteSpace="break-spaces">
          {description}
        </Text>
      </VStack>
    </HStack>
  );
}
