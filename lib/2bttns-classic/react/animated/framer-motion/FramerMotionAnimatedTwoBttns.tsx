import { motion } from "framer-motion"
import { ButtonId } from "../../TwoBttnsRound/types"
import use2bttnsAnimations from "./use2bttnsAnimations"

export type RenderButton = (config: {
  button: ButtonId
  buttonComponent: JSX.Element
  pickDisabled: boolean
}) => JSX.Element

export type FramerMotionAnimatedTwoBttnsProps = {
  children: (
    config: ReturnType<typeof use2bttnsAnimations> & {
      renderButton: RenderButton
    }
  ) => JSX.Element
}

export default function FramerMotionAnimatedTwoBttns({
  children,
}: FramerMotionAnimatedTwoBttnsProps) {
  const config = use2bttnsAnimations()
  const { variants, animate, variantAnimation } = config

  const renderButton: RenderButton = ({
    button,
    buttonComponent,
    pickDisabled,
  }) => {
    return (
      <motion.div
        variants={variants}
        animate={button === 1 ? animate.bttn1 : animate.bttn2}
        onHoverStart={() => {
          if (pickDisabled) return
          variantAnimation(button, "focused")
        }}
        onHoverEnd={() => {
          if (pickDisabled) return
          variantAnimation(button, "initial")
        }}
        onTapStart={() => {
          if (pickDisabled) return
          variantAnimation(button, "tapping")
        }}
        onTapCancel={() => {
          if (pickDisabled) return
          variantAnimation(button, "initial")
        }}
      >
        {buttonComponent}
      </motion.div>
    )
  }

  return <div>{children({ ...config, renderButton })}</div>
}
