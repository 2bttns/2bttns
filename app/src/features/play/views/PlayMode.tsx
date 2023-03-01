import { Mode } from "../modes/_index";

export type PlayProps<ModeFrontendProps extends {}> = {
  ModeFrontendComponent: Mode<ModeFrontendProps>["FrontendComponent"];
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
