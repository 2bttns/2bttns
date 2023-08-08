import { useState } from "react";
import { homePageTutorial } from "./views/steps/homePageTutorial";
import { TwobttnsTutorial } from "./views/steps/tutorial";
import TwobttnsTutorials from "./views/TwobttnsTutorials";

export default function TwobttnsTutorialsContainer() {
  const [tutorial, setTutorial] = useState<TwobttnsTutorial | null>(
    homePageTutorial
  );

  //   const router = useRouter();

  //   useEffect(() => {
  //     if (router.pathname === "/") {
  //       setTutorial(homePageTutorial);
  //     } else {
  //       setTutorial(null);
  //     }
  //   }, [router.pathname]);

  if (!tutorial) {
    return null;
  }

  return (
    <TwobttnsTutorials
      steps={tutorial.steps}
      onJoyrideCallback={tutorial?.onJoyrideCallback}
    />
  );
}
