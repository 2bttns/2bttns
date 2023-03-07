import { useMachine } from "@xstate/react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import wait from "../../../../utils/wait";
import createMachine2bttns, {
  countNumToReplace,
  getChoicesRemaining,
} from "./twobttns.machine";
import {
  DefaultOptionFields,
  Item,
  ItemPolicy,
  ReplacePolicy,
  Results,
  States,
} from "./types";
import useAnimations from "./useAnimations";
import useHotkey, { Hotkey } from "./useHotkey";

export type RegisterButtonConfig = {
  button: DefaultOptionFields;
  buttonComponent: JSX.Element;
};

export type RegisterButton = (config: RegisterButtonConfig) => JSX.Element;

export type LoadItemsOnDemandCallback<I extends Item> = (
  count: number
) => Promise<I[]>;

export type Use2bttnsMachineConfig<I extends Item> = {
  items: ItemPolicy<I>;
  onFinish: (results: Results) => Promise<void>;
  hotkeys?: { [K in DefaultOptionFields]: Hotkey };
  replace?: ReplacePolicy;
  loadItemsOnDemandCallback?: LoadItemsOnDemandCallback<I>;
};

const machine = createMachine2bttns();

export default function use2bttnsMachine<I extends Item>({
  items,
  onFinish,
  hotkeys,
  replace = "keep-picked",
  loadItemsOnDemandCallback,
}: Use2bttnsMachineConfig<I>) {
  const { variants, controls, animateVariant, animate, duration } =
    useAnimations();

  const [current, send] = useMachine(machine);
  const [canPick, setCanPick] = useState(false);
  const canPickRef = useRef<boolean>(canPick);
  const numItemsToLoadOnDemandRef = useRef<number>(0);

  const isFinished = (current.value as States) === "finished";

  const handleButtonClick =
    (button: RegisterButtonConfig["button"]) => async () => {
      if (!canPickRef.current) {
        console.error(":: 2bttns - Picking disabled, please wait.");
        return;
      }

      const otherButton: RegisterButtonConfig["button"] =
        button === "first" ? "second" : "first";

      send({
        type: "PICK_ITEM",
        args: { key: button },
      });
      await animate.beforeAll();

      const onPickAnimations = async () => {
        await Promise.all([
          animate[button].onPickedPre(),
          animate[otherButton].onNotPickedPre(),
        ]);
        return;
      };

      await Promise.race([onPickAnimations(), wait(duration)]);

      switch (items.type) {
        case "preload":
          send({ type: "READY_FOR_NEXT_ITEMS", args: {} });
          break;
        case "load-on-demand":
          if (!loadItemsOnDemandCallback) {
            throw new Error(
              ":: 2bttns - loadItemsOnDemand is undefined; Required for load-on-demand ItemPolicy"
            );
          }
          send({ type: "READY_FOR_NEXT_ITEMS", args: {} });
          await wait(0.1);
          const count = numItemsToLoadOnDemandRef.current;
          const itemsToLoad = await loadItemsOnDemandCallback(count);
          send({
            type: "LOAD_NEXT_ITEMS_ON_DEMAND",
            args: { itemsToLoad },
          });
      }

      const onPickPostAnimations = async () => {
        await Promise.all([
          animate[button].onPickedPost(),
          animate[otherButton].onNotPickedPost(),
        ]);
      };
      await Promise.race([onPickPostAnimations(), wait(duration)]);

      await animate.afterAll(), send({ type: "PICK_READY", args: {} });
    };

  const registerButton: RegisterButton = ({ button, buttonComponent }) => {
    return (
      <motion.div
        variants={variants}
        animate={controls[button]}
        onHoverStart={() => {
          if (!canPick) return;
          animateVariant(button, "focused");
        }}
        onHoverEnd={() => {
          if (!canPick) return;
          animateVariant(button, "initial");
        }}
        onTapStart={() => {
          if (!canPick) return;
          animateVariant(button, "tapping");
        }}
        onTapCancel={() => {
          if (!canPick) return;
          animateVariant(button, "initial");
        }}
        onClick={handleButtonClick(button)}
      >
        {buttonComponent}
      </motion.div>
    );
  };

  useEffect(() => {
    switch (items.type) {
      case "preload":
        send({ type: "INIT_ITEMS_PRELOAD", args: { items, replace } });
        send({ type: "PICK_READY", args: {} });
        break;
      case "load-on-demand":
        (async function () {
          if (!loadItemsOnDemandCallback) {
            throw new Error(
              ":: 2bttns - loadItemsOnDemandCallback is undefined; required for load-on-demand ItemPolicy"
            );
          }
          send({ type: "INIT_ITEMS_LOAD_ON_DEMAND", args: { items, replace } });
          await wait(0.1);
          const count = numItemsToLoadOnDemandRef.current;
          const itemsToLoad = await loadItemsOnDemandCallback(count);
          await wait(0.1);
          send({
            type: "LOAD_NEXT_ITEMS_ON_DEMAND",
            args: {
              itemsToLoad,
            },
          });
          send({ type: "PICK_READY", args: {} });
        })();
        break;
      default:
        throw new Error(":: 2bttns - Invalid items type");
    }
  }, []);

  useEffect(() => {
    const isPickingState = (current.value as States) === "picking";
    setCanPick(isPickingState);
    canPickRef.current = isPickingState;
  }, [current.value]);

  useEffect(() => {
    numItemsToLoadOnDemandRef.current = countNumToReplace(current.context);
  }, [current.value]);

  useEffect(() => {
    if (isFinished) {
      onFinish(current.context.results);
    }
  }, [isFinished]);

  useHotkey({
    hotkey: hotkeys?.first ?? [],
    onPress: handleButtonClick("first"),
  });
  useHotkey({
    hotkey: hotkeys?.second ?? [],
    onPress: handleButtonClick("second"),
  });

  const choicesRemaining = useMemo(() => {
    return getChoicesRemaining(current.context);
  }, [current.context]);

  return {
    registerButton,
    current_options: current.context.current_options,
    isFinished,
    context: current.context,
    choicesRemaining,
    state: current.value,
  };
}
