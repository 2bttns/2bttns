import { Box, IconButton, Tooltip } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import ReactJoyride, {
  ACTIONS as JOYRIDE_ACTIONS,
  CallBackProps as JoyrideCallBackProps,
  EVENTS as JOYRIDE_EVENTS,
  STATUS as JOYRIDE_STATUS,
} from "react-joyride";
import useIsRedirecting from "../../shared/hooks/useIsRedirecting";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRedirecting = useIsRedirecting();

  const [joyride, setJoyride] = useState<ReactJoyride["props"]>({
    run: false,
    steps,
    stepIndex,
  });

  useEffect(() => {
    setJoyride((prev) => ({ ...prev, steps }));
  }, [steps]);

  useEffect(() => {
    // Update global context when joyride state changes, so components using the context can react to it
    context.setCurrentJoyrideState(joyride);
  }, [context, joyride]);

  const clearTutorialQueryParams = () => {
    // Clears step query params from URL
    const searchParamsDict = Object.fromEntries(searchParams.entries());
    delete searchParamsDict["step"];
    void router.push(
      {
        pathname: router.pathname,
        query: searchParamsDict,
      },
      undefined,
      { shallow: true }
    );
  };

  const updateQueryParams = useCallback(() => {
    // Updates query params to match current step index & tutorial
    // Keeps additional query params intact, if any exist
    if (
      context.tutorialId === null ||
      joyride.stepIndex === undefined ||
      joyride.stepIndex < 0 ||
      joyride.stepIndex >= steps.length
    ) {
      clearTutorialQueryParams();
      return;
    }
    const searchParamsDict = Object.fromEntries(searchParams.entries());
    searchParamsDict["step"] = (joyride.stepIndex + 1).toString();
    void router.push(
      {
        pathname: router.pathname,
        query: searchParamsDict,
      },
      undefined,
      { shallow: true }
    );
  }, [context.tutorialId, steps, joyride.stepIndex]);

  useEffect(() => {
    // Update query params when step index state changes
    if (!joyride.run) return;
    updateQueryParams();
  }, [joyride.stepIndex, joyride.run]);

  useEffect(() => {
    // Set step index from query params, if provided
    const queryStepIndex = searchParams.has("step")
      ? Number(searchParams.get("step")) - 1
      : null;
    if (
      queryStepIndex !== null &&
      (queryStepIndex < 0 || queryStepIndex >= steps.length)
    ) {
      clearTutorialQueryParams();
      setJoyride((prev) => ({ ...prev, run: false, stepIndex: 0 }));
      return;
    }

    if (queryStepIndex === null) {
      setJoyride((prev) => ({ ...prev, run: false, stepIndex: 0 }));
      return;
    }

    setJoyride((prev) => ({
      ...prev,
      stepIndex: queryStepIndex,
      run: true,
    }));
  }, [searchParams, steps]);

  const handleJoyrideCallback = useCallback(
    async (data: JoyrideCallBackProps) => {
      const { action, index, status, type, step } = data;

      if (action === JOYRIDE_ACTIONS.SKIP) {
        clearTutorialQueryParams();
        setJoyride((prev) => ({ ...prev, run: false, stepIndex: 0 }));
        return;
      }

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
    if (!startOnMount && !didMount) return; // Don't start on mount unless specified
    if (joyride.run) return; // Don't restart if the tutorial is already running
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
      {!isRedirecting && (
        <ReactJoyrideComponent
          {...joyride}
          callback={handleJoyrideCallback}
          showProgress
          continuous
          showSkipButton
          disableScrolling
          disableScrollParentFix
          disableCloseOnEsc
          disableOverlayClose
          hideCloseButton
          spotlightClicks
          styles={{
            options: {
              primaryColor: "#415DB7",
            },
          }}
          {...rest}
        />
      )}
    </>
  );
}
