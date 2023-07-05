import { ModeUI, ModeUIProps } from "../../../modes/types";

export default function PlayMode<
  ModeFrontendProps extends ModeUIProps<any>
>(props: {
  ModeFrontendComponent: ModeUI<ModeFrontendProps>["FrontendComponent"];
  modeFrontendProps: ModeFrontendProps;
}) {
  const { ModeFrontendComponent, modeFrontendProps } = props;

  return (
    <>
      <ModeFrontendComponent {...modeFrontendProps} />
    </>
  );
}
