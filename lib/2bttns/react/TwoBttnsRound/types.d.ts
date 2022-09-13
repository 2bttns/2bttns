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
 *  @type "keep-picked"    - Replace the non-picked item so it can be compared to the previous winner
 *  @type "replace-picked"  - Replace the picked item
 *  @type "replace-both"    - Replace both items after one is picked
 */
export type ReplacePolicy = "keep-picked" | "replace-picked" | "replace-both"

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

export type BttnCallback = () => Promise<void>

export type BttnCallbackConfig = {
  onPickedPre?: BttnCallback
  onPickedPost?: BttnCallback
  onNotPickedPre?: BttnCallback
  onNotPickedPost?: BttnCallback
}

export type HotkeyConfig = {
  hotkey?: Hotkey
}

export type SingleBttnConfig = BttnCallbackConfig & HotkeyConfig

export type BttnConfig = {
  beforeAll?: BttnCallback
  afterAll?: BttnCallback
  bttn1?: SingleBttnConfig
  bttn2?: SingleBttnConfig
}
