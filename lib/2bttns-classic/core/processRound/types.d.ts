import {
  Choice,
  ChoiceShape,
  TwobttnsRoundDocument as RoundDocument,
} from "../../react/TwoBttnsRound/types"
import WeightPlugin from "./plugins/WeightPlugin"

export type Scores = {
  [choiceId: ChoiceShape["id"]]: number
}

/**
 * User-defined function that determines how to get data associated with a choice ID
 *
 * For example, a fetch call to an activities API that gets choice activity data by ID
 */
export type ChoicesAdapter<T extends ChoiceShape = ChoiceShape> = (
  choiceIds: ChoiceShape["id"][]
) => Promise<ChoiceDataById<T>>

export type ChoiceDataById<T extends ChoiceShape = ChoiceShape> = {
  [choiceId: string]: T
}

export type ProcessRoundOptions<T extends ChoiceShape = ChoiceShape> = {
  round: RoundDocument<T>
  choicesAdapter: ChoicesAdapter<T>
  plugins?: WeightPlugin[]
}