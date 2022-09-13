import { EasingFunction, useAnimation, Variant } from 'framer-motion'
import { DefaultOptionFields } from './types'

export type AnimationVariants =
    | 'initial'
    | 'picked'
    | 'notPickedUpwards'
    | 'notPickedDownwards'
    | 'focused'
    | 'tapping'

export type Easing =
    | [number, number, number, number]
    | 'linear'
    | 'easeIn'
    | 'easeOut'
    | 'easeInOut'
    | 'circIn'
    | 'circOut'
    | 'circInOut'
    | 'backIn'
    | 'backOut'
    | 'backInOut'
    | 'anticipate'
    | EasingFunction

export type UseAnimationsConfig = {
    duration?: number
    ease?: Easing
}

export default function useAnimations(props?: UseAnimationsConfig) {
    const duration = props?.duration ?? 0.4
    const ease = props?.ease ?? 'backOut'

    const controls = {
        first: useAnimation(),
        second: useAnimation(),
    }

    const variants: { [V in AnimationVariants]: Variant } = {
        initial: { scale: 1, y: 0, opacity: 1 },
        picked: { scale: 1.5, y: 0, opacity: 1 },
        notPickedUpwards: { scale: 0, y: -100, opacity: 0 },
        notPickedDownwards: { scale: 0, y: 100, opacity: 0 },
        focused: { scale: 1.1, y: 0, opacity: 1 },
        tapping: { scale: 0.9, y: 0, opacity: 1 },
    }

    const animateVariant = async (
        bttn: DefaultOptionFields,
        variant: AnimationVariants
    ) => {
        controls[bttn].stop()
        await controls[bttn].start(variant, { duration, ease })
    }

    const getBttnAnimation = (button: DefaultOptionFields) => {
        return {
            onPickedPre: async () => {
                await animateVariant(button, 'picked')
            },
            onPickedPost: async () => {
                await animateVariant(button, 'initial')
            },
            onNotPickedPre: async () => {
                await animateVariant(
                    button,
                    button === 'first'
                        ? 'notPickedUpwards'
                        : 'notPickedDownwards'
                )
            },
            onNotPickedPost: async () => {
                await animateVariant(button, 'initial')
            },
        }
    }

    const animate = {
        beforeAll: async () => {},
        afterAll: async () => {},
        first: getBttnAnimation('first'),
        second: getBttnAnimation('second'),
    }

    return { controls, animate, variants, animateVariant, duration }
}
