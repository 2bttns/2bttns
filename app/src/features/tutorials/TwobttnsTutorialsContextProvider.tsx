import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import ReactJoyride from "react-joyride";
import { tutorialsRegistry } from "./views/steps/tutorialsRegistry";

export type TwobttnsTutorialId = keyof typeof tutorialsRegistry;

const TwobttnsTutorialsContext = createContext<{
  tutorialId: TwobttnsTutorialId | null;
  setTutorialId: Dispatch<SetStateAction<TwobttnsTutorialId | null>>;
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

  const [tutorialId, setTutorialId] = useState<TwobttnsTutorialId | null>(null);
  const clearTutorial = () => setTutorialId(null);

  const [currentJoyrideState, setCurrentJoyrideState] = useState<
    ReactJoyride["props"] | null
  >(null);

  return (
    <TwobttnsTutorialsContext.Provider
      value={{
        tutorialId,
        setTutorialId,
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
