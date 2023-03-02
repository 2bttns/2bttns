import { useMachine } from "@xstate/react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import wait from "../../../../utils/wait";
import createMachine2bttns, { getChoicesRemaining } from "./twobttns.machine";
import {
  DefaultOptionFields,
  Item,
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

export type Use2bttnsMachineConfig = {
  items: Item[];
  onFinish: (results: Results) => Promise<void>;
  hotkeys?: { [K in DefaultOptionFields]: Hotkey };
  replace?: ReplacePolicy;
};

const machine = createMachine2bttns();

export default function use2bttnsMachine({
  items,
  onFinish,
  hotkeys,
  replace = "keep-picked",
}: Use2bttnsMachineConfig) {
  const { variants, controls, animateVariant, animate, duration } =
    useAnimations();

  const [current, send] = useMachine(machine);
  const [canPick, setCanPick] = useState(false);
  const canPickRef = useRef<boolean>(canPick);

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

      send({ type: "LOAD_NEXT_ITEMS", args: {} });

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
    send({ type: "INIT", args: { items, replace } });
    send({ type: "PICK_READY", args: {} });
  }, []);

  useEffect(() => {
    const isPickingState = (current.value as States) === "picking";
    setCanPick(isPickingState);
    canPickRef.current = isPickingState;
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
  };
}
