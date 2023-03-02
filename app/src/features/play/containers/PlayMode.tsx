import { ModeUI } from "../../../modes/types";

export type PlayProps<ModeFrontendProps extends {}> = {
  ModeFrontendComponent: ModeUI<ModeFrontendProps>["FrontendComponent"];
  modeFrontendProps: ModeFrontendProps;
};

export default function PlayMode<ModeFrontendProps extends {}>(
  props: PlayProps<ModeFrontendProps>
) {
  const { ModeFrontendComponent, modeFrontendProps } = props;

  return (
    <>
      <ModeFrontendComponent {...modeFrontendProps} />
    </>
  );
}
