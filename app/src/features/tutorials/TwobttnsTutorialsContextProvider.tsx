import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import type { TwobttnsTutorial } from "./views/steps/tutorial";

const TwobttnsTutorialsContext = createContext<{
  tutorial: TwobttnsTutorial | null;
  setTutorial: Dispatch<SetStateAction<TwobttnsTutorial | null>>;
  clearTutorial: () => void;
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

  return (
    <TwobttnsTutorialsContext.Provider
      value={{ tutorial, setTutorial, clearTutorial }}
    >
      {children}
    </TwobttnsTutorialsContext.Provider>
  );
};

export default TwobttnsTutorialsContextProvider;
