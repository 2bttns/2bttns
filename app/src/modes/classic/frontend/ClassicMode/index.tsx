import ClassicButton, { ClassicButtonProps } from "./ClassicButton";
import { Item } from "./types";
import use2bttnsMachine, { Use2bttnsMachineConfig } from "./use2bttnsMachine";

export type RenderPropParams = {
  button1: React.ReactNode;
  button2: React.ReactNode;
  context: ReturnType<typeof use2bttnsMachine>["context"];
  isFinished: ReturnType<typeof use2bttnsMachine>["isFinished"];
  choicesRemaining: ReturnType<typeof use2bttnsMachine>["choicesRemaining"];
  totalChoices: ReturnType<typeof use2bttnsMachine>["totalChoices"];
  state: ReturnType<typeof use2bttnsMachine>["state"];
};

export type ClassicModeProps<I extends Item> = {
  children: (params: RenderPropParams) => JSX.Element;
  hotkeys?: Use2bttnsMachineConfig<I>["hotkeys"];
  buttonProps?: {
    shared?: Partial<ClassicButtonProps>;
    button1?: Partial<ClassicButtonProps>;
    button2?: Partial<ClassicButtonProps>;
  };
  showButtonColorBars?: boolean;

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
    children,
    hotkeys,
    showButtonColorBars,
    itemPolicy,
    loadItemsCallback,
    numRoundItems,
    onFinish,
    renderItem = (item) => item.id,
    replace,
    buttonProps,
  } = props;

  const {
    choicesRemaining,
    totalChoices,
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
        <ClassicButton
          hotkey={hotkeys?.first[0]}
          showColorBar={showButtonColorBars}
          {...buttonProps?.shared}
          {...buttonProps?.button1}
        >
          {current_options.first ? renderItem(current_options.first as I) : ""}
        </ClassicButton>
      ),
    }),
    button2: registerButton({
      button: "second",
      buttonComponent: (
        <ClassicButton
          hotkey={hotkeys?.second[0]}
          showColorBar={showButtonColorBars}
          {...buttonProps?.shared}
          {...buttonProps?.button2}
        >
          {current_options.second
            ? renderItem(current_options.second as I)
            : ""}
        </ClassicButton>
      ),
    }),
    context,
    isFinished,
    choicesRemaining,
    totalChoices,
    state,
  });
}
