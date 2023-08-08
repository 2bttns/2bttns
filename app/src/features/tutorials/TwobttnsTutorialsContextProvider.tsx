import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import ReactJoyride from "react-joyride";
import type { TwobttnsTutorial } from "./views/steps/tutorial";

const TwobttnsTutorialsContext = createContext<{
  tutorial: TwobttnsTutorial | null;
  setTutorial: Dispatch<SetStateAction<TwobttnsTutorial | null>>;
  clearTutorial: () => void;
  currentJoyrideState: ReactJoyride["props"] | null;
  setCurrentJoyrideState: Dispatch<
    SetStateAction<Readonly<ReactJoyride["props"]> | null>
  >;
} | null>(null);

export const useTwoBttnsTutorialsContext = () => {
  const context = useContext(TwobttnsTutorialsContext);

  if (!context) {
    throw new Error(
      "useTwoBttnsTutorialsContext must be used within a TwobttnsTutorialsContextProvider"
    );
  }

  return context;
};

const TwobttnsTutorialsContextProvider = (props: {
  children: React.ReactNode;
}) => {
  const { children } = props;

  const [tutorial, setTutorial] = useState<TwobttnsTutorial | null>(null);
  const clearTutorial = () => setTutorial(null);

  const [currentJoyrideState, setCurrentJoyrideState] = useState<
    ReactJoyride["props"] | null
  >(null);

  return (
    <TwobttnsTutorialsContext.Provider
      value={{
        tutorial,
        setTutorial,
        clearTutorial,
        currentJoyrideState,
        setCurrentJoyrideState,
      }}
    >
      {children}
    </TwobttnsTutorialsContext.Provider>
  );
};

export default TwobttnsTutorialsContextProvider;
