import { useAnimation, Variant } from 'framer-motion'
import { DefaultOptionFields } from '../core/types'

export type AnimationVariants =
    | 'initial'
    | 'picked'
    | 'notPickedUpwards'
    | 'notPickedDownwards'
    | 'focused'
    | 'tapping'

export default function useAnimations() {
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
        await controls[bttn].start(variant)
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

    return { controls, animate, variants, animateVariant }
}
