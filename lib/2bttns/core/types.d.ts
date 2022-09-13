import { Hotkey } from "./useHotkey"

/**
 * @summary A 2bttns "choice" should be an object with an ID and any other string field names
 */
export interface ChoiceShape {
  id: string
  [field: string]: any
}

/**
 * @summary Resulting data structure from a 2bttns round
 * @field choices - list of choices the user made for the round
 * @field popped - list of ids that the user "popped," wishing to exclude them from their feed
 */
export interface TwobttnsRoundDocument<T extends ChoiceShape = ChoiceShape> {
  choices: Choice<T>[]
  popped: T[]
}

/**
 *  @summary Number of items to replace after a choice is made
 *  @type "keep-picked"    - Replace all non-picked items
 *  @type "replace-picked"  - Replace only the picked item
 *  @type "replace-all"    - Replace all items after one is picked
 */
export type ReplacePolicy = "keep-picked" | "replace-picked" | "replace-all"

/**
 * @summary Callback that triggers upon round end, providing end result choices as a parameter
 */
export type HandleRoundEnd<T extends ChoiceShape> = (
  choices: Choice<T>[]
) => void

export type Choice<T extends ChoiceShape = ChoiceShape> = {
  picked: T
  notPicked: T
  delta?: number
}

export type HandleBttnClick = (button: ButtonId) => () => void

export type ButtonId = 1 | 2

export type AsyncCallback = () => Promise<void>

export type BttnCallbackConfig = {
  onPickedPre?: AsyncCallback
  onPickedPost?: AsyncCallback
  onNotPickedPre?: AsyncCallback
  onNotPickedPost?: AsyncCallback
}

export type HotkeyConfig = {
  hotkey?: Hotkey
}

export type SingleBttnConfig = BttnCallbackConfig & HotkeyConfig

export type BttnConfig = {
  beforeAll?: AsyncCallback
  afterAll?: AsyncCallback
  bttn1?: SingleBttnConfig
  bttn2?: SingleBttnConfig
}
