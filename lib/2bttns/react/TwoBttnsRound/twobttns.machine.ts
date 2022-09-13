import { assign, createMachine } from "xstate"
import { TwoBttnsRoundProps } from "."
import { AsyncCallback } from "../../core/utils/runAsyncCallbacks"
import {
  ButtonId,
  Choice,
  ChoiceShape,
  ReplacePolicy,
  SingleBttnConfig,
} from "./types"

export type Events2bttns<T extends ChoiceShape = ChoiceShape> =
  | {
      type: "INIT"
      items: T[]
      bttnConfig?: Context2bttns["bttnConfig"]
      replace?: Context2bttns["replace"]
    }
  | { type: "LOAD_NEXT_ITEMS" }
  | { type: "PICK_ITEM"; buttonId: ButtonId; deltaMS: number }

export interface Context2bttns<T extends ChoiceShape = ChoiceShape> {
  replace: ReplacePolicy
  itemQueue: T[]
  choices: Choice<T>[]
  options: [T | null, T | null]
  toReplace: [boolean, boolean]
  bttnConfig: TwoBttnsRoundProps<T>["bttnConfig"]
  beforeItemLoadCallbacks: AsyncCallback[][]
  afterItemLoadCallbacks: Context2bttns["beforeItemLoadCallbacks"]
}

export type TypeState2bttns<T extends ChoiceShape = ChoiceShape> =
  | {
      value: "starting"
      context: Context2bttns<T>
    }
  | {
      value: "loadingNextItems"
      context: Context2bttns<T>
    }
  | {
      value: "picking"
      context: Context2bttns<T>
    }
  | {
      value: "pickingDisabled"
      context: Context2bttns<T>
    }
  | {
      value: "finished"
      context: Context2bttns<T>
    }

const createMachine2bttns = <T extends ChoiceShape = ChoiceShape>() => {
  return createMachine<Context2bttns<T>, Events2bttns<T>, TypeState2bttns<T>>({
    id: "2bttns",
    initial: "starting",
    context: {
      itemQueue: [],
      choices: [],
      options: [null, null],
      toReplace: [true, true],
      bttnConfig: undefined,
      replace: "keep-picked",
      beforeItemLoadCallbacks: [],
      afterItemLoadCallbacks: [],
    },
    states: {
      starting: {
        on: {
          INIT: {
            target: "loadingNextItems",
            actions: assign({
              itemQueue: (context, event) => {
                return event.items
              },
              bttnConfig: (context, event) => {
                return event.bttnConfig
              },
              replace: (context, event) => {
                return event.replace
              },
            }),
          },
        },
      },
      loadingNextItems: {
        entry: assign({
          options: (ctx) => {
            const updatedOptions: typeof ctx.options = [...ctx.options]
            ctx.toReplace.forEach((shouldReplace, index) => {
              if (!shouldReplace) return
              const nextItem = ctx.itemQueue.shift()
              if (!nextItem) {
                return
              }
              updatedOptions[index] = nextItem
            })

            return updatedOptions
          },
        }),
        always: [
          {
            target: "picking",
            cond: (ctx) => hasEnoughChoices(ctx),
          },
          {
            target: "finished",
            cond: (ctx) => !hasEnoughChoices(ctx),
          },
        ],
      },
      picking: {
        on: {
          PICK_ITEM: {
            target: "pickingDisabled",
            actions: assign({
              choices: (context, event) => {
                const pickedIndex = event.buttonId - 1
                const notPickedIndex = pickedIndex === 0 ? 1 : 0

                const choice: Context2bttns<T>["choices"][0] = {
                  picked: context.options[pickedIndex],
                  notPicked: context.options[notPickedIndex],
                  delta: event.deltaMS,
                }

                return context.choices.concat(choice)
              },
              toReplace: (context, event) => {
                const pickedIndex = event.buttonId - 1
                const notPickedIndex = pickedIndex === 0 ? 1 : 0

                const toReplace: typeof context.toReplace = [false, false]

                switch (context.replace) {
                  case "keep-picked":
                    toReplace[notPickedIndex] = true
                    break
                  case "replace-both":
                    toReplace[pickedIndex] = true
                    toReplace[notPickedIndex] = true
                    break
                  case "replace-picked":
                    toReplace[pickedIndex] = true
                    break
                }

                return toReplace
              },
              beforeItemLoadCallbacks: (context, event) => {
                const pickedNum = event.buttonId
                const notPickedNum = pickedNum === 1 ? 2 : 1

                const pickedConf = context.bttnConfig[`bttn${pickedNum}`] as
                  | SingleBttnConfig
                  | undefined
                const notPickedConf = context.bttnConfig[
                  `bttn${notPickedNum}`
                ] as SingleBttnConfig | undefined

                const callbacks: Context2bttns["beforeItemLoadCallbacks"] = []

                callbacks.push([context.bttnConfig?.beforeAll])
                callbacks.push([
                  pickedConf?.onPickedPre,
                  notPickedConf?.onNotPickedPre,
                ])

                return callbacks
              },
              afterItemLoadCallbacks: (context, event) => {
                const pickedNum = event.buttonId
                const notPickedNum = pickedNum === 1 ? 2 : 1

                const pickedConf = context.bttnConfig[`bttn${pickedNum}`] as
                  | SingleBttnConfig
                  | undefined
                const notPickedConf = context.bttnConfig[
                  `bttn${notPickedNum}`
                ] as SingleBttnConfig | undefined

                const callbacks: Context2bttns["afterItemLoadCallbacks"] = []
                callbacks.push([
                  pickedConf?.onPickedPost,
                  notPickedConf?.onNotPickedPost,
                ])
                callbacks.push([context.bttnConfig?.afterAll])

                return callbacks
              },
            }),
          },
        },
      },
      pickingDisabled: {
        on: {
          LOAD_NEXT_ITEMS: { target: "loadingNextItems" },
        },
      },
      finished: {
        entry: () => {
          console.log("FINISHED")
        },
      },
    },
  })
}

export default createMachine2bttns

function hasEnoughChoices(context: Context2bttns) {
  switch (context.replace) {
    case "keep-picked":
    case "replace-picked":
      return context.itemQueue.length >= 1
    case "replace-both":
      return context.itemQueue.length >= 2
  }
}
