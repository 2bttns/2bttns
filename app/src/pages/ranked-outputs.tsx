import { Box, Code, HStack, Select, Stack, Text } from "@chakra-ui/react";
import { Player } from "@prisma/client";
import { GetServerSideProps } from "next";
import { useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import { NAVBAR_HEIGHT_PX } from "../features/navbar/views/Navbar";
import { TagOption } from "../features/tags/containers/TagBadges";
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

  const fullHeight = `calc(100vh - ${NAVBAR_HEIGHT_PX})`;

  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      height={fullHeight}
      width="100%"
      bgColor="gray.700"
      color="whiteAlpha.900"
    >
      <Stack direction="column" spacing="1rem" height="100%" padding="1rem">
        <h1>Ranked Outputs Preview</h1>
        <HStack justifyContent="space-between">
          <Text fontWeight="bold">For player...</Text>
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
          <Text fontWeight="bold">View ranked outputs for...</Text>
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
          <Text fontWeight="bold">Relative to...</Text>
          {/* TODO: Replace with filter tags sidebar */}
          <Box width="250px" color="black">
            <MultiSelect
              options={
                tagsQuery.data?.tags.map((tag) => ({
                  label: tag.name,
                  value: tag.id,
                })) ?? []
              }
              value={inputTags}
              onChange={(nextTags: any) => {
                setInputTags(nextTags as any);
                utils.gameObjects.getRanked.invalidate();
              }}
              labelledBy="Select Input Tags"
            />
          </Box>
        </HStack>
      </Stack>
      <Box height="100%" overflow="hidden" bgColor="white" flex={1}>
        <Box
          height="32px"
          maxHeight="32px"
          overflowX="scroll"
          overflowY="clip"
          backgroundColor={outputs.data ? "black" : "unset"}
        >
          {outputs.data && (
            <Code
              width="100%"
              display="block"
              fontFamily={"monospace"}
              color="#97E998"
              borderRadius="0"
              whiteSpace={"nowrap"}
              backgroundColor="black"
            >
              <>
                Equivalent API call: GET /api/game-objects/ranked?playerId=
                {selectedPlayer}&inputTags=
                {inputTags.map((t) => t.key).join(",")}&outputTag=
                {outputTag}
              </>
            </Code>
          )}
        </Box>
        <Code
          width="100%"
          maxHeight="calc(100% - 32px)"
          overflowY="scroll"
          as="pre"
          display="block"
          fontFamily={"monospace"}
          padding="0"
          margin="0"
        >
          {outputs.data && JSON.stringify(outputs.data.scores, null, 2)}
        </Code>
      </Box>
    </Stack>
  );
}
