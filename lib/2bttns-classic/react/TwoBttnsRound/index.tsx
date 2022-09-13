import { BttnConfig, ChoiceShape } from "./types"
import useHotkey from "./useHotkey"
import useTwoBttnsRound, {
  UseTwoBttnsRoundConfig,
  UseTwoBttnsRoundResults
} from "./useTwoBttnsRound"

export type TwoBttnsRoundProps<T extends ChoiceShape = ChoiceShape> = {
  children: (config: UseTwoBttnsRoundResults<T>) => JSX.Element
  items: UseTwoBttnsRoundConfig<T>["items"]
  handleRoundEnd: UseTwoBttnsRoundConfig<T>["handleRoundEnd"]
  replace?: UseTwoBttnsRoundConfig<T>["replace"]
  deltaDelay?: UseTwoBttnsRoundConfig<T>["deltaDelay"]
  bttnConfig?: BttnConfig
}

function TwoBttnsRound<T extends ChoiceShape>({
  children,
  items,
  handleRoundEnd,
  deltaDelay = 100,
  replace = "keep-picked",
  bttnConfig,
}: TwoBttnsRoundProps<T>) {
  const round = useTwoBttnsRound<T>({
    items,
    handleRoundEnd,
    replace,
    deltaDelay,
    bttnConfig,
  })

  useHotkey({
    hotkey: bttnConfig?.bttn1?.hotkey,
    onPress: round.handleBttnClick(1),
  })

  useHotkey({
    hotkey: bttnConfig?.bttn2?.hotkey,
    onPress: round.handleBttnClick(2),
  })

  return <>{children(round)}</>
}

export default TwoBttnsRound
