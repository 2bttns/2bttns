/* eslint-disable react-hooks/exhaustive-deps */
import { useMachine } from "@xstate/react"
import { useEffect, useRef } from "react"
import { TwoBttnsRoundProps } from "."
import runAsyncCallbackBatches from "../../core/utils/runAsyncCallbacks"
import createMachine2bttns, { TypeState2bttns } from "./twobttns.machine"
import {
  ChoiceShape,
  HandleBttnClick,
  HandleRoundEnd,
  ReplacePolicy,
} from "./types"
import useDeltaTimer, { UseDeltaTimerConfig } from "./useDeltaTimer"

export type UseTwoBttnsRoundConfig<T extends ChoiceShape> = {
  items: T[]
  replace?: ReplacePolicy
  handleRoundEnd: HandleRoundEnd<T>
  deltaDelay: UseDeltaTimerConfig["deltaDelay"]
  bttnConfig?: TwoBttnsRoundProps<T>["bttnConfig"]
}

export type UseTwoBttnsRoundResults<T extends ChoiceShape> = {
  bttn1Item: T | null
  bttn2Item: T | null
  handleBttnClick: HandleBttnClick
  roundOver: boolean
  pickDisabled: boolean
}

export default function useTwoBttnsRound<T extends ChoiceShape = ChoiceShape>({
  items,
  handleRoundEnd,
  deltaDelay,
  replace = "replace-picked",
  bttnConfig,
}: UseTwoBttnsRoundConfig<T>) {
  const machine = useRef(createMachine2bttns<T>())
  const [current, send, service] = useMachine(machine.current)
  const pickDisabled = !current.matches("picking")

  const { delta, initDeltaTimer, clearDeltaTimer } = useDeltaTimer({
    deltaDelay,
  })

  useEffect(() => {
    service.onTransition((state) => {
      const val = state.value as TypeState2bttns["value"]
      switch (val) {
        case "picking":
          initDeltaTimer()
          runAsyncCallbackBatches(state.context.afterItemLoadCallbacks)
          break
        case "pickingDisabled":
          runAsyncCallbackBatches(state.context.beforeItemLoadCallbacks).then(
            () => {
              send({ type: "LOAD_NEXT_ITEMS" })
            }
          )
          break
        case "finished":
          handleRoundEnd(state.context.choices)
          clearDeltaTimer()
          break
      }
    })
  }, [])

  useEffect(() => {
    send({ type: "INIT", items, bttnConfig, replace: replace })
  }, [])

  const handleBttnClick: HandleBttnClick = (buttonId) => {
    return async () => {
      if (pickDisabled) {
        console.error("[2bttns SDK] PICKING DISABLED")
        return
      }

      send({ type: "PICK_ITEM", buttonId, deltaMS: delta.current })
    }
  }

  return {
    bttn1Item: current.context.options[0],
    bttn2Item: current.context.options[1],
    handleBttnClick,
    roundOver: current.matches("finished"),
    pickDisabled,
  }
}
