import { useState } from "react";
import { useDebounce } from "use-debounce";

export type UseDebouncedValueParams = {
  initialValue?: string;
  delay?: number;
};

export default function useDebouncedValue(
  params: UseDebouncedValueParams = {}
) {
  const { initialValue = "", delay = 500 } = params;
  const [input, setInput] = useState(initialValue);
  const [debouncedInput] = useDebounce(input, delay);
  return { debouncedInput, input, setInput };
}
