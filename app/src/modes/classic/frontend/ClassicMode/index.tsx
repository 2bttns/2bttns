import ClassicButton, { ClassicButtonProps } from "./ClassicButton";
import { Item } from "./types";
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
  children: (params: RenderPropParams) => JSX.Element;
  hotkeys?: Use2bttnsMachineConfig<I>["hotkeys"];
  button1Props?: Partial<ClassicButtonProps>;
  button2Props?: Partial<ClassicButtonProps>;

  // TODO: Allow for custom ReactNode rendering of items
  renderItem?: (item: I) => string;

  itemPolicy?: Use2bttnsMachineConfig<I>["itemPolicy"];
  loadItemsCallback: Use2bttnsMachineConfig<I>["loadItemsCallback"];
  numRoundItems: Use2bttnsMachineConfig<I>["numRoundItems"];
  replace?: Use2bttnsMachineConfig<I>["replace"];
  onFinish: Use2bttnsMachineConfig<I>["onFinish"];
};

export default function ClassicMode<I extends Item>(
  props: ClassicModeProps<I>
) {
  const {
    button1Props,
    button2Props,
    children,
    hotkeys,
    itemPolicy,
    loadItemsCallback,
    numRoundItems,
    onFinish,
    renderItem = (item) => item.id,
    replace,
  } = props;

  const {
    choicesRemaining,
    context,
    current_options,
    isFinished,
    registerButton,
    state,
  } = use2bttnsMachine({
    hotkeys,
    itemPolicy,
    loadItemsCallback,
    numRoundItems,
    onFinish,
    replace,
  });

  return children({
    button1: registerButton({
      button: "first",
      buttonComponent: (
        <ClassicButton hotkey={hotkeys?.first[0]} {...button1Props}>
          {current_options.first ? renderItem(current_options.first as I) : ""}
        </ClassicButton>
      ),
    }),
    button2: registerButton({
      button: "second",
      buttonComponent: (
        <ClassicButton hotkey={hotkeys?.second[0]} {...button2Props}>
          {current_options.second
            ? renderItem(current_options.second as I)
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
