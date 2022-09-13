import { Choice, ChoiceShape } from "@/lib/2bttns/react/TwoBttnsRound/types"
import getDefaultScores from "../getDefaultScores"
import { Scores } from "../types"

export interface ApplyOptions<T extends ChoiceShape = ChoiceShape> {
  choices: Choice<T>[]
}

export interface ApplyResults {
  pluginScores: Scores
}

export default abstract class WeightPlugin<
  T extends ChoiceShape = ChoiceShape
> {
  public apply({ choices }: ApplyOptions<T>): ApplyResults {
    return { pluginScores: getDefaultScores(choices) }
  }
}
