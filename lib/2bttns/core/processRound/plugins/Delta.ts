import WeightPlugin, { ApplyOptions, ApplyResults } from "./WeightPlugin"

export const DEFAULT_WINNER_DELTA_MULTIPLIER = 1.0
export const DEFAULT_LOSER_DELTA_MULTIPLIER = 1.0

export type DeltaOptions = {
  winnerDeltaMultiplier?: number
  loserDeltaMultiplier?: number
}

/**
 * Apply score weighting based on "delta" choice time
 */
export default class Delta extends WeightPlugin {
  winnerDeltaMultiplier: number = DEFAULT_WINNER_DELTA_MULTIPLIER
  loserDeltaMultiplier: number = DEFAULT_LOSER_DELTA_MULTIPLIER

  constructor(options?: DeltaOptions) {
    super()

    if (!options) return
    const {
      winnerDeltaMultiplier = DEFAULT_WINNER_DELTA_MULTIPLIER,
      loserDeltaMultiplier = DEFAULT_LOSER_DELTA_MULTIPLIER,
    } = options

    this.winnerDeltaMultiplier = winnerDeltaMultiplier
    this.loserDeltaMultiplier = loserDeltaMultiplier
  }

  public apply(options: ApplyOptions): ApplyResults {
    const { pluginScores } = super.apply(options)
    const { choices } = options

    choices.forEach(({ picked, notPicked, delta = 0 }) => {
      pluginScores[picked.id] += this.winnerDeltaMultiplier * delta
      pluginScores[notPicked.id] += this.loserDeltaMultiplier * delta
    })

    return { pluginScores }
  }
}
