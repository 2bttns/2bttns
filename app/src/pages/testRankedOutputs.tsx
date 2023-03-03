import { Box, Code, HStack, Select, Stack, Text } from "@chakra-ui/react";
import { Player } from "@prisma/client";
import { GetServerSideProps } from "next";
import { useState } from "react";
import TagMultiSelect, {
  TagOption,
} from "../features/gameobjects/containers/TagMultiSelect";
import { NAVBAR_HEIGHT_PX } from "../features/navbar/views/Navbar";
import { api } from "../utils/api";
import getSessionWithSignInRedirect from "../utils/getSessionWithSignInRedirect";

type ReturnType = {
  playerId: Player["id"];
};

export const getServerSideProps: GetServerSideProps<ReturnType> = async (
  ctx
) => {
  const { session, redirect } = await getSessionWithSignInRedirect(ctx);

  if (!session && redirect) {
    return {
      redirect,
    };
  }

  return {
    props: { playerId: session!.user.id },
  };
};

export default function testRankedOutputs(props: ReturnType) {
  const { playerId } = props;

  const [inputTags, setInputTags] = useState<TagOption[]>([]);
  const [outputTag, setOutputTag] = useState<string | undefined>();

  const utils = api.useContext();
  const tagsQuery = api.tags.getAll.useQuery();
  const outputs = api.gameObjects.getRanked.useQuery(
    {
      playerId,
      inputTags: inputTags.map((tag) => tag.value),
      outputTag: outputTag!,
    },
    {
      enabled: !!outputTag && !!inputTags.length,
      keepPreviousData: false,
    }
  );

  const fullHeight = `calc(100vh - ${NAVBAR_HEIGHT_PX} - 2rem)`;

  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      height={fullHeight}
      width="100%"
      bgColor="gray.700"
      color="whiteAlpha.900"
    >
      <Stack direction="column" spacing="1rem" height="100%" padding="1rem">
        <h1>testRankedOutputs for {playerId}</h1>

        <HStack>
          <Text fontWeight="bold">Output Tag</Text>
          <Box width="250px">
            {tagsQuery.data && (
              <Select
                placeholder="Select Output Tag"
                value={outputTag}
                onChange={(e) => {
                  setOutputTag(e.target.value);
                  utils.gameObjects.getRanked.invalidate();
                }}
                bgColor="white"
                color="black"
              >
                {tagsQuery.data.tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </Select>
            )}
          </Box>
        </HStack>

        <HStack>
          <Text fontWeight="bold">Input Tags</Text>
          <Box width="250px">
            <TagMultiSelect
              selected={inputTags}
              onChange={(nextTags) => {
                setInputTags(
                  nextTags.map((tag) => ({
                    value: tag,
                    label:
                      tagsQuery.data?.tags.find((t) => t.id === tag)?.name ||
                      "Unknown",
                  }))
                );
                utils.gameObjects.getRanked.invalidate();
              }}
            />
          </Box>
        </HStack>
      </Stack>
      <Box height="100%" overflow="hidden" bgColor="white" flex={1}>
        <Code
          width="100%"
          maxHeight="100%"
          overflowY="scroll"
          as="pre"
          display="block"
        >
          {outputs.data && JSON.stringify(outputs.data.scores, null, 2)}
        </Code>
      </Box>
    </Stack>
  );
}
