import { ChoiceShape } from "@/lib/2bttns/react/TwoBttnsRound/types"
import WeightPlugin, { ApplyOptions, ApplyResults } from "./WeightPlugin"

export const DEFAULT_RELATED_BONUS_WINNER = 2_000
export const DEFAULT_RELATED_BONUS_LOSER = 0

export type ChoiceWithRelatedIds = ChoiceShape & { relatedIds: string[] }

export type RelatedOptions = {
  relatedBonusWinner?: number
  relatedBonusLoser?: number
}

/**
 * Apply score weighting based based on relatedId fields of a choice
 */
export default class Related<
  T extends ChoiceWithRelatedIds
> extends WeightPlugin<T> {
  relatedBonusWinner: number = DEFAULT_RELATED_BONUS_WINNER
  relatedBonusLoser: number = DEFAULT_RELATED_BONUS_WINNER

  constructor(options?: RelatedOptions) {
    super()

    if (!options) return
    const {
      relatedBonusWinner = DEFAULT_RELATED_BONUS_WINNER,
      relatedBonusLoser = DEFAULT_RELATED_BONUS_LOSER,
    } = options

    this.relatedBonusWinner = relatedBonusWinner
    this.relatedBonusLoser = relatedBonusLoser
  }

  public apply(options: ApplyOptions<T>): ApplyResults {
    const { pluginScores } = super.apply(options)
    const { choices } = options
    this.validateChoiceData(choices)

    choices.forEach(({ picked, notPicked }) => {
      if (this.relatedBonusWinner > 0) {
        picked.relatedIds.forEach((relatedId) => {
          pluginScores[relatedId] =
            (pluginScores[relatedId] ?? 0) + this.relatedBonusWinner
        })
      }

      if (this.relatedBonusLoser > 0) {
        notPicked.relatedIds.forEach((relatedId) => {
          pluginScores[relatedId] =
            (pluginScores[relatedId] ?? 0) + this.relatedBonusLoser
        })
      }
    })

    return { pluginScores }
  }

  private validateChoiceData(choices: ApplyOptions<T>["choices"]) {
    const allData = [
      ...choices.map((c) => c.picked),
      ...choices.map((c) => c.notPicked),
    ]

    for (const data of allData) {
      if (data.relatedIds == undefined || !Array.isArray(data.relatedIds))
        throw new Error("All choice data must have relatedIds string[] field")
    }
  }
}
