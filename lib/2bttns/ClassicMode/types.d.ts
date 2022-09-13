/**
 *  @summary Number of items to replace after a choice is made
 *  @type "keep-picked"    - Replace all non-picked items
 *  @type "replace-picked"  - Replace only the picked item
 *  @type "replace-all"    - Replace all items after one is picked
 */
export type ReplacePolicy = 'keep-picked' | 'replace-picked' | 'replace-all'

export type AsyncCallback = () => Promise<void>

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
    not_picked: I
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
