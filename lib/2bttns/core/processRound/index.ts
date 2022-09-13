import {
  Choice,
  ChoiceShape,
  TwobttnsRoundDocument as RoundDocument,
} from "../../react/TwoBttnsRound/types"
import getDefaultScores from "./getDefaultScores"
import Gladiator from "./plugins/Gladiator"
import WeightPlugin from "./plugins/WeightPlugin"
import {
  ChoiceDataById,
  ChoicesAdapter,
  ProcessRoundOptions,
  Scores,
} from "./types"

async function processRound({
  round,
  choicesAdapter,
  plugins = [new Gladiator()],
}: ProcessRoundOptions): Promise<Scores> {
  // @TODO: Handle popped choices
  const choiceDataById = await getChoicesData(round, choicesAdapter)
  const choicesWithData = getChoicesWithData(round, choiceDataById)
  const scores = getScores(choicesWithData, plugins)
  return scores
}

export default processRound

export function getScores(choices: Choice[], plugins: WeightPlugin[]): Scores {
  const pluginScores = plugins.map(
    (plugin) => plugin.apply({ choices: choices }).pluginScores
  )

  const totalScores = getDefaultScores(choices)
  for (const scores of pluginScores) {
    for (const choiceId of Object.keys(scores)) {
      totalScores[choiceId] = (totalScores[choiceId] ?? 0) + scores[choiceId]
    }
  }

  return totalScores
}

function getChoicesWithData(
  round: RoundDocument<ChoiceShape>,
  choiceDataById: ChoiceDataById<ChoiceShape>
) {
  const choices: Choice[] = []
  for (const { picked, notPicked, delta } of round.choices) {
    choices.push({
      picked: choiceDataById[picked.id],
      notPicked: choiceDataById[notPicked.id],
      delta,
    })
  }
  return choices
}

export async function getChoicesData(
  round: RoundDocument<ChoiceShape>,
  choicesAdapter: ChoicesAdapter<ChoiceShape>
): Promise<ChoiceDataById> {
  const choiceIds: Set<string> = new Set()
  for (const { picked, notPicked } of round.choices) {
    choiceIds.add(picked.id)
    choiceIds.add(notPicked.id)
  }

  const choiceData = await choicesAdapter(Array.from(choiceIds))
  return choiceData
}
