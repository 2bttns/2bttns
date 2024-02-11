import { Box, HStack, Progress, Stack, Text, Tooltip } from "@chakra-ui/react";
import Image from "next/image";
import { ModeUIProps } from "../../../types";
import ClassicMode, { ClassicModeProps } from "../ClassicMode";
import { Item } from "../ClassicMode/types";

export type ClassicModeViewProps<I extends Item> = {
  gameData: ModeUIProps<I>["gameData"];
  itemPolicy: ClassicModeProps<I>["itemPolicy"];
  numRoundItems: ClassicModeProps<I>["numRoundItems"];
  loadItemsCallback: ClassicModeProps<I>["loadItemsCallback"];
  replacePolicy: ClassicModeProps<I>["replace"];
  onFinish: ClassicModeProps<I>["onFinish"];
  renderItem: ClassicModeProps<I>["renderItem"];
  question?: string;
  showButtonColorBars?: boolean;
};

export default function ClassicModeView<I extends Item>(
  props: ClassicModeViewProps<I>
) {
  const {
    gameData: { game },
    itemPolicy,
    numRoundItems,
    onFinish,
    replacePolicy,
    loadItemsCallback,
    renderItem,
    question,
    showButtonColorBars,
  } = props;

  return (
    <>
      <ClassicMode
        itemPolicy={itemPolicy}
        numRoundItems={numRoundItems}
        loadItemsCallback={loadItemsCallback}
        renderItem={renderItem}
        hotkeys={{
          first: ["w", "ArrowUp"],
          second: ["s", "ArrowDown"],
        }}
        showButtonColorBars={showButtonColorBars}
        onFinish={onFinish}
        replace={replacePolicy}
        buttonProps={{
          shared: {
            sx: {
              borderRadius: "16px",
              border: "none",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)",
              bgColor: "white",
              _hover: {
                bgColor: "#f2f2f2",
              },
              width: { base: "100%", sm: "512px" },
            },
          },
        }}
      >
        {({
          button1,
          button2,
          isFinished,
          context,
          state,
          choicesRemaining,
          totalChoices,
        }) => {
          return (
            <Stack direction="column" alignItems="center" paddingTop="4rem">
              <Image
                src="/2btnns-webgif-compressed.gif"
                width={64}
                height={64}
                alt="2bttns"
                className="classicMode__icon"
              />
              <Text
                as="h1"
                sx={{
                  fontSize: "32px",
                  marginBottom: "2rem",
                  marginTop: "2rem",
                  textAlign: "center",
                }}
                className={`classicMode__question classicMode__question--${
                  isFinished ? "finished" : "not-finished"
                }`}
              >
                {isFinished ? "Round 🎉 over!" : question}
              </Text>
              <Box>
                {!isFinished && (
                  <>
                    {button1}
                    <Text
                      sx={{
                        textTransform: "uppercase",
                        padding: "1rem",
                        textAlign: "center",
                      }}
                      className="classicMode__or-text"
                    >
                      or
                    </Text>
                    {button2}
                  </>
                )}
              </Box>
              {totalChoices && (
                <Box
                  width="100%"
                  paddingTop={isFinished ? "0px" : "5rem"}
                  paddingX="2rem"
                >
                  <Box
                    width={{ base: "100%", sm: "350px", md: "450px" }}
                    mx="auto"
                  >
                    <ChoicesRemainingProgressBar
                      choicesRemaining={choicesRemaining}
                      totalChoices={totalChoices}
                    />
                  </Box>
                </Box>
              )}
            </Stack>
          );
        }}
      </ClassicMode>
    </>
  );
}

export type ChoicesRemainingProgressBarProps = {
  choicesRemaining: number;
  totalChoices: number;
};

function ChoicesRemainingProgressBar({
  choicesRemaining,
  totalChoices,
}: ChoicesRemainingProgressBarProps) {
  const current = totalChoices - choicesRemaining;
  const max = totalChoices;
  const percentage = Math.round((current / max) * 100);
  const isComplete = max === current;

  return (
    <>
      <Tooltip
        label={
          <>
            {choicesRemaining} / {totalChoices} choices remaining
          </>
        }
        placement="top"
        className="classicMode__progress-tooltip"
      >
        <HStack
          width="100%"
          className={`classicMode__progress-container ${
            isComplete ? "classicMode__progress-container--complete" : ""
          }`}
        >
          <Progress
            value={current}
            max={max}
            width="100%"
            height="8px"
            borderRadius="16px"
            colorScheme="green"
            sx={{
              "& > div:first-of-type": {
                transitionProperty: "width",
                transitionTimingFunction: "cubic-bezier(0.175, 0.75, 0.5, 1.2)",
              },
            }}
            className="classicMode__progress-bar"
          />
          <Text className="classicMode__progress-text">{percentage}%</Text>
        </HStack>
      </Tooltip>
    </>
  );
}
