import { useEffect } from "react";

/**
 * KeyboardEvent.key string value
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
 */
export type Hotkey = string | string[];

export type UseHotkeyConfig = {
  hotkey: Hotkey | undefined;
  onPress: () => void;
};

export default function useHotkey({ hotkey, onPress }: UseHotkeyConfig) {
  useEffect(() => {
    if (hotkey === undefined) {
      return;
    }

    const handleHotkeyPress = (e: KeyboardEvent) => {
      if (e.key === hotkey || hotkey.indexOf(e.key) !== -1) {
        onPress();
      }
    };

    if (typeof window !== "undefined") {
      window.removeEventListener("keyup", handleHotkeyPress);
      window.addEventListener("keyup", handleHotkeyPress);

      return () => {
        window.removeEventListener("keyup", handleHotkeyPress);
      };
    }
  }, [hotkey, onPress]);
}
