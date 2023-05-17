import { Box, Code, HStack, Select, Stack, Text } from "@chakra-ui/react";
import { Player } from "@prisma/client";
import { GetServerSideProps } from "next";
import { useState } from "react";
import TagMultiSelect, {
  TagOption,
} from "../features/gameobjects/containers/TagMultiSelect";
import { NAVBAR_HEIGHT_PX } from "../features/navbar/views/Navbar";
import { prisma } from "../server/db";
import { api } from "../utils/api";
import getSessionWithSignInRedirect from "../utils/getSessionWithSignInRedirect";

type ReturnType = {
  playerId: Player["id"];
  allPlayers: Player[];
};

export const getServerSideProps: GetServerSideProps<ReturnType> = async (
  ctx
) => {
  const { session, redirect } = await getSessionWithSignInRedirect(ctx);

  const players = await prisma.player.findMany();

  if (!session && redirect) {
    return {
      redirect,
    };
  }

  return {
    props: {
      playerId: session!.user.id,
      allPlayers: JSON.parse(JSON.stringify(players)),
    },
  };
};

export default function TestRankedOutputs(props: ReturnType) {
  const { playerId, allPlayers } = props;

  const [inputTags, setInputTags] = useState<TagOption[]>([]);
  const [outputTag, setOutputTag] = useState<string | undefined>();
  const [selectedPlayer, setSelectedPlayer] = useState<
    Player["id"] | undefined
  >(playerId);

  const utils = api.useContext();
  const tagsQuery = api.tags.getAll.useQuery();
  const outputs = api.gameObjects.getRanked.useQuery(
    {
      playerId: selectedPlayer!,
      inputTags: inputTags.map((tag) => tag.value).join(","),
      outputTag: outputTag!,
    },
    {
      enabled: !!outputTag && !!inputTags.length && !!selectedPlayer,
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
        <HStack justifyContent="space-between">
          <Text fontWeight="bold">Player</Text>
          <Box width="250px">
            {
              <Select
                placeholder="Select Player"
                value={selectedPlayer}
                onChange={(e) => {
                  setSelectedPlayer(e.target.value);
                  utils.gameObjects.getRanked.invalidate();
                }}
                bgColor="white"
                color="black"
              >
                {allPlayers.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.id}
                  </option>
                ))}
              </Select>
            }
          </Box>
        </HStack>
        <HStack justifyContent="space-between">
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

        <HStack justifyContent="space-between">
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
