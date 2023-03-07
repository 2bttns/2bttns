import ClassicButton, { ClassicButtonProps } from "./ClassicButton";
import { Item, ReplacePolicy } from "./types";
import use2bttnsMachine, { Use2bttnsMachineConfig } from "./use2bttnsMachine";

export type RenderPropParams = {
  button1: React.ReactNode;
  button2: React.ReactNode;
  context: ReturnType<typeof use2bttnsMachine>["context"];
  isFinished: ReturnType<typeof use2bttnsMachine>["isFinished"];
  choicesRemaining: ReturnType<typeof use2bttnsMachine>["choicesRemaining"];
  state: ReturnType<typeof use2bttnsMachine>["state"];
};

export type ClassicModeProps<I extends Item> = {
  // TODO: Replace Item type with GameObject type
  items: Use2bttnsMachineConfig<I>["items"];
  children: (params: RenderPropParams) => JSX.Element;
  hotkeys?: Use2bttnsMachineConfig<I>["hotkeys"];
  button1Props?: Partial<ClassicButtonProps>;
  button2Props?: Partial<ClassicButtonProps>;

  // TODO: Allow for custom ReactNode rendering of items
  renderItem?: (item: I) => string;

  onFinish: Use2bttnsMachineConfig<I>["onFinish"];
  replace?: ReplacePolicy;
  loadItemsOnDemandCallback?: Use2bttnsMachineConfig<I>["loadItemsOnDemandCallback"];
};

export default function ClassicMode<I extends Item>(
  props: ClassicModeProps<I>
) {
  const {
    items,
    hotkeys,
    children,
    button1Props,
    button2Props,
    renderItem = (item) => item.id,
    onFinish,
    replace,
    loadItemsOnDemandCallback,
  } = props;

  const {
    registerButton,
    current_options,
    isFinished,
    context,
    choicesRemaining,
    state,
  } = use2bttnsMachine({
    items,
    hotkeys,
    onFinish,
    replace,
    loadItemsOnDemandCallback,
  });

  return children({
    button1: registerButton({
      button: "first",
      buttonComponent: (
        <ClassicButton hotkey={hotkeys?.first[0]} {...button1Props}>
          {current_options.first
            ? renderItem(current_options.first as any)
            : ""}
        </ClassicButton>
      ),
    }),
    button2: registerButton({
      button: "second",
      buttonComponent: (
        <ClassicButton hotkey={hotkeys?.second[0]} {...button2Props}>
          {current_options.second
            ? renderItem(current_options.second as any)
            : ""}
        </ClassicButton>
      ),
    }),
    context,
    isFinished,
    choicesRemaining,
    state,
  });
}
