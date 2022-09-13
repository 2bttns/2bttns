import WeightPlugin, { ApplyOptions, ApplyResults } from "./WeightPlugin"

export const DEFAULT_WINNER_BONUS = 10_000
export const DEFAULT_LOSER_BONUS = 2_000
export const DEFAULT_ABSORB_LOSER = true

export type GladiatorOptions = {
  winnerBonus?: number
  loserBonus?: number
  absorbLoser?: boolean
}

/**
 * Apply score weighting based on "winner" and "loser" activities
 */
export default class Gladiator extends WeightPlugin {
  winnerBonus: number = DEFAULT_WINNER_BONUS
  loserBonus: number = DEFAULT_LOSER_BONUS
  absorbLoser: boolean = DEFAULT_ABSORB_LOSER

  constructor(options?: GladiatorOptions) {
    super()

    if (!options) return
    const {
      winnerBonus = DEFAULT_WINNER_BONUS,
      loserBonus = DEFAULT_LOSER_BONUS,
      absorbLoser = DEFAULT_ABSORB_LOSER,
    } = options

    this.winnerBonus = winnerBonus
    this.loserBonus = loserBonus
    this.absorbLoser = absorbLoser
  }

  public apply(options: ApplyOptions): ApplyResults {
    const { pluginScores } = super.apply(options)
    const { choices: choicesWithData } = options

    choicesWithData.forEach(({ picked, notPicked }) => {
      pluginScores[picked.id] += this.winnerBonus

      if (this.absorbLoser) {
        pluginScores[picked.id] += pluginScores[notPicked.id]
      }

      pluginScores[notPicked.id] += this.loserBonus
    })

    return { pluginScores }
  }
}
