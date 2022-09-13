import { assign, createMachine } from 'xstate'
import { AsyncCallback, ReplacePolicy } from './types'

export interface Item {
    id: string
    [additional_property: string]: any
}

export type Choice<I extends Item, OptionFields extends string> = {
    [key in OptionFields]: I | null
}

export type ChoiceReplacement<OptionFields extends string> = {
    [key in OptionFields]: boolean
}

export interface UserChoice<I extends Item> {
    picked: I
    not_picked: I[]
}

export interface Events<I extends Item, OptionFields extends string> {
    INIT: {
        items: I[]
        replace?: Context<I, OptionFields>['replace_policy']
    }

    LOAD_NEXT_ITEMS: {}

    PICK_READY: {}

    PICK_ITEM: {
        key: keyof OptionFields
    }
}

export type EventObject<E extends Events<any, any> = Events<any, any>> = {
    [K in keyof E]: {
        type: K
        args: E[K]
    }
}[keyof E]

export interface Context<I extends Item, OptionFields extends string> {
    item_queue: I[]
    current_options: Choice<I, OptionFields>
    to_replace: ChoiceReplacement<OptionFields>
    results: UserChoice<I>[]
    replace_policy: ReplacePolicy
    callbacks: {
        beforeItemLoad: AsyncCallback[]
        afterItemLoad: AsyncCallback[]
    }
}

export type States =
    | 'starting'
    | 'loading_next_items'
    | 'picking'
    | 'picking_disabled'
    | 'finished'

export type TypeState<I extends Item, OptionFields extends string> = {
    value: States
    context: Context<I, OptionFields>
}

export type DefaultOptionFields = 'first' | 'second'

const createMachine2bttns = <I extends Item = Item>() => {
    return (
        /** @xstate-layout N4IgpgJg5mDOIC5QCYBGAXdA7WA6W6AhgE7oCWWUAxAJIByNAKoqAA4D2sZ57WLIAD0QBWAJy4AHKOQAWAMyi5wgOxLR8gGwAaEAE9Ec5MlwaADDNUTZGgIzLlNuQF8nOtJhy4ANu0IQKUAD6WGAC6IHcYAC2sFT8HFw8fEiCiMjKuMrCGhrCwjaiwnIywjKmyDr6CMIScrgKcqamGsi2tsqiLm4Y2HisZADGANYBVAAKNADCANKBTACiALLxnNxkvPxCCDKyJjsSpsoSB8jFGsqViLbCkoqmNubKMjJWNl0g7r24-cMBgf6wQioLyQKgAGQA8gBBAAigTo8wAGow5owlgBlFaJdbJUBbBQ3OTXfKNMrZGyXbYvXCmCQ1cp5RxyDoaFyuEBYdgQOD8T6eAgkciULFrDYpLbZXA2VoSaWiZT3UTnCSU6z1OQa4qGHIPInvPl4Hx+P4hMIRdDReApBKi3GpBDIcREsw2eTIJoKFrCSnyCQmGw2CS2F6PQz6nqeH4jYXW1ZJTZpXJSxzSQwydTIRzaPRXR31O6BsQFYSncMePqDaNBAFAkEQEXx8WIMrGR3S56NJmmOSUooaXDp4oMuwWQ5lr4AMwoZFgAAtIA2cQmHWITBoJDJckodsgxD2cwhVOJ1w8dqY8lknuOcIuxXiDJlsrl8oViqVyjJKSP1Zrdx1ZY6yBsk4QA */
        createMachine<
            Context<I, DefaultOptionFields>,
            EventObject,
            TypeState<I, DefaultOptionFields>
        >({
            context: {
                current_options: { first: null, second: null },
                item_queue: [],
                results: [],
                to_replace: { first: true, second: true },
                replace_policy: 'keep-picked',
                callbacks: {
                    afterItemLoad: [],
                    beforeItemLoad: [],
                },
            },
            id: '2bttns',
            initial: 'starting',
            states: {
                starting: {
                    on: {
                        INIT: {
                            actions: assign({
                                item_queue: (context, event) => {
                                    return event.args.items
                                },
                                replace_policy: (context, event) => {
                                    return event.args.replace ?? 'keep-picked'
                                },
                            }),
                            target: 'loading_next_items',
                        },
                    },
                },
                loading_next_items: {
                    entry: assign({
                        current_options: (ctx) => {
                            const updatedOptions = { ...ctx.current_options }
                            Object.keys(ctx.to_replace).forEach((key) => {
                                const replaceKey =
                                    key as keyof ChoiceReplacement<DefaultOptionFields>
                                const shouldReplace = ctx.to_replace[replaceKey]
                                if (!shouldReplace) return
                                const nextItem = ctx.item_queue.shift()
                                if (!nextItem) {
                                    return
                                }
                                updatedOptions[replaceKey] = nextItem
                            })

                            return updatedOptions
                        },
                    }),
                    always: [
                        {
                            cond: (ctx) =>
                                !hasEnoughChoices<I, DefaultOptionFields>(ctx),
                            target: 'finished',
                        },
                    ],
                    on: {
                        PICK_READY: {
                            target: 'picking',
                        },
                    },
                },
                picking: {
                    on: {
                        PICK_ITEM: {
                            actions: assign({
                                results: (context, event) => {
                                    const choiceKey = event.args
                                        .key as keyof ChoiceReplacement<DefaultOptionFields>
                                    const { current_options } = context
                                    const picked = current_options[choiceKey]
                                    if (!picked) {
                                        throw new Error('Value is null')
                                    }

                                    const choice: UserChoice<I> = {
                                        picked,
                                        not_picked: [],
                                    }

                                    Object.keys(current_options).forEach(
                                        (k) => {
                                            const key =
                                                k as keyof ChoiceReplacement<DefaultOptionFields>
                                            if (key === choiceKey) return
                                            const non_picked_item =
                                                current_options[key]
                                            if (non_picked_item) {
                                                choice.not_picked.push(
                                                    non_picked_item
                                                )
                                            }
                                        }
                                    )

                                    return context.results.concat(choice)
                                },
                                to_replace: (context, event) => {
                                    const choiceKey = event.args
                                        .key as keyof ChoiceReplacement<DefaultOptionFields>

                                    const toReplace = { ...context.to_replace }

                                    Object.keys(context.to_replace).forEach(
                                        (k) => {
                                            const key =
                                                k as keyof ChoiceReplacement<DefaultOptionFields>

                                            switch (context.replace_policy) {
                                                case 'keep-picked':
                                                    toReplace[key] =
                                                        key !== choiceKey
                                                    break
                                                case 'replace-all':
                                                    toReplace[key] = true
                                                    break
                                                case 'replace-picked':
                                                    toReplace[key] =
                                                        key === choiceKey
                                                    break
                                            }
                                        }
                                    )

                                    return toReplace
                                },
                            }),
                            target: 'picking_disabled',
                        },
                    },
                },
                picking_disabled: {
                    on: {
                        LOAD_NEXT_ITEMS: {
                            target: 'loading_next_items',
                        },
                    },
                },
                finished: {
                    entry: () => {
                        console.log('FINISHED')
                    },
                },
            },
        })
    )
}

export default createMachine2bttns

function hasEnoughChoices<I extends Item, OptionFields extends string>(
    context: Context<I, OptionFields>
) {
    switch (context.replace_policy) {
        case 'keep-picked':
        case 'replace-picked':
            return context.item_queue.length >= 1
        case 'replace-all':
            return (
                context.item_queue.length >=
                Object.keys(context.to_replace).length
            )
        default:
            return false
    }
}
