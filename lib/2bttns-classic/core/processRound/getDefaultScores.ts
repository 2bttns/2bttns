import { Choice } from "../../react/TwoBttnsRound/types"
import { Scores } from "./types"

export default function getDefaultScores(choices: Choice[]) {
  const scores: Scores = {}
  for (const { picked, notPicked } of choices) {
    scores[picked.id] = 0
    scores[notPicked.id] = 0
  }
  return scores
}
