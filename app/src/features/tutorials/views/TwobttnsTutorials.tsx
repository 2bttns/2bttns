import { Box, IconButton, Tooltip } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import ReactJoyride, {
  ACTIONS as JOYRIDE_ACTIONS,
  CallBackProps as JoyrideCallBackProps,
  EVENTS as JOYRIDE_EVENTS,
  STATUS as JOYRIDE_STATUS,
} from "react-joyride";
import { useTwoBttnsTutorialsContext } from "../TwobttnsTutorialsContextProvider";

const ReactJoyrideComponent = dynamic(() => import("react-joyride"), {
  ssr: false,
});

export type TwobttnsTutorialsProps = {
  toggleRestartTutorial?: boolean;
  startOnMount?: boolean;
  onJoyrideCallback?: (params: {
    data: JoyrideCallBackProps;
    joyrideState: {
      state: ReactJoyride["props"];
      setState: React.Dispatch<React.SetStateAction<ReactJoyride["props"]>>;
    };
    router: ReturnType<typeof useRouter>;
    context: ReturnType<typeof useTwoBttnsTutorialsContext>;
  }) => void;
} & ReactJoyride["props"];

export const TUTORIAL_BUTTON_ID = "home-tutorial-button";

export default function TwobttnsTutorials(props: TwobttnsTutorialsProps) {
  const {
    toggleRestartTutorial,
    startOnMount = false,
    onJoyrideCallback,
    ...rest
  } = props;
  const { steps, stepIndex = 0 } = rest;
  const context = useTwoBttnsTutorialsContext();

  const [joyride, setJoyride] = useState<ReactJoyride["props"]>({
    run: false,
    steps,
    stepIndex,
  });

  const router = useRouter();

  const handleJoyrideCallback = useCallback(
    async (data: JoyrideCallBackProps) => {
      const { action, index, status, type, step } = data;

      if (
        [JOYRIDE_EVENTS.STEP_AFTER, JOYRIDE_EVENTS.TARGET_NOT_FOUND].includes(
          type as any
        )
      ) {
        // Update state to advance the tour
        setJoyride((prev) => ({
          ...prev,
          stepIndex: index + (action === JOYRIDE_ACTIONS.PREV ? -1 : 1),
        }));
      } else if (
        [JOYRIDE_STATUS.FINISHED, JOYRIDE_STATUS.SKIPPED].includes(
          status as any
        )
      ) {
        // Need to set our running state to false, so we can restart if we click start again.
        setJoyride((prev) => ({ ...prev, run: false }));
      }

      if (onJoyrideCallback) {
        onJoyrideCallback({
          data,
          joyrideState: { state: joyride, setState: setJoyride },
          router,
          context,
        });
      }
    },
    [onJoyrideCallback]
  );

  const [didMount, setDidMount] = useState(false);
  useEffect(() => {
    setDidMount(true);
  }, []);

  const [toggleRestartState, setToggleRestartState] = useState(
    toggleRestartTutorial
  );
  const restartTutorial = () => {
    setToggleRestartState((prev) => !prev);
  };
  useEffect(() => {
    if (!startOnMount && !didMount) return;
    setJoyride((prev) => ({ ...prev, stepIndex: 0, run: true }));
  }, [toggleRestartState]);

  return (
    <>
      {steps.length > 0 && (
        <Box
          position="fixed"
          bottom="1rem"
          right="1rem"
          id={TUTORIAL_BUTTON_ID}
          zIndex={1}
        >
          <Tooltip label="View tutorial for this page" placement="left">
            <IconButton
              onClick={restartTutorial}
              icon={<FaQuestionCircle />}
              aria-label="View tutorial for this page"
            />
          </Tooltip>
        </Box>
      )}
      <ReactJoyrideComponent
        {...joyride}
        callback={handleJoyrideCallback}
        showProgress
        continuous
        showSkipButton
        disableScrolling
        disableCloseOnEsc
        disableOverlayClose
        hideCloseButton
        styles={{
          options: {
            primaryColor: "#415DB7",
          },
        }}
        {...rest}
      />
    </>
  );
}
