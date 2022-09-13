import { useAnimation, Variant } from "framer-motion"
import { TwoBttnsRoundProps } from "../../TwoBttnsRound"
import { ButtonId } from "../../TwoBttnsRound/types"

export type AnimationVariants =
  | "initial"
  | "picked"
  | "notPickedUpwards"
  | "notPickedDownwards"
  | "focused"
  | "tapping"

export default function use2bttnsAnimations() {
  const animate = {
    bttn1: useAnimation(),
    bttn2: useAnimation(),
  }

  const variants: { [V in AnimationVariants]: Variant } = {
    initial: { scale: 1, y: 0, opacity: 1 },
    picked: { scale: 1.5, y: 0, opacity: 1 },
    notPickedUpwards: { scale: 0, y: -100, opacity: 0 },
    notPickedDownwards: { scale: 0, y: 100, opacity: 0 },
    focused: { scale: 1.1, y: 0, opacity: 1 },
    tapping: { scale: 0.9, y: 0, opacity: 1 },
  }

  const variantAnimation = async (
    bttn: ButtonId,
    variant: AnimationVariants
  ) => {
    if (bttn === 1) {
      await animate.bttn1.stop()
      await animate.bttn1.start(variant)
    } else {
      await animate.bttn2.stop()
      await animate.bttn2.start(variant)
    }
  }

  const bttnConfig: TwoBttnsRoundProps["bttnConfig"] = {
    beforeAll: async () => {},
    afterAll: async () => {},
    bttn1: {
      onPickedPre: async () => {
        await variantAnimation(1, "picked")
      },
      onPickedPost: async () => {
        await variantAnimation(1, "initial")
      },
      onNotPickedPre: async () => {
        await variantAnimation(1, "notPickedUpwards")
      },
      onNotPickedPost: async () => {
        await variantAnimation(1, "initial")
      },
    },
    bttn2: {
      onPickedPre: async () => {
        await variantAnimation(2, "picked")
      },
      onPickedPost: async () => {
        await variantAnimation(2, "initial")
      },
      onNotPickedPre: async () => {
        await variantAnimation(2, "notPickedDownwards")
      },
      onNotPickedPost: async () => {
        await variantAnimation(2, "initial")
      },
    },
  }

  return { animate, bttnConfig, variants, variantAnimation }
}
