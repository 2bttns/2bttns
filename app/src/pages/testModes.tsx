import { classicMode } from "../features/play/modes/classic/_index";
import PlayMode from "../features/play/views/PlayMode";
import { NextPageWithLayout } from "./_app";

const TestModesPage: NextPageWithLayout = (props) => {
  return (
    <>
      <PlayMode
        ModeFrontendComponent={classicMode.FrontendComponent}
        modeFrontendProps={{ name: "test" }}
      />
    </>
  );
};

export default TestModesPage;
