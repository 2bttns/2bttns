import { useMachine } from '@xstate/react'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { DefaultOptionFields, Item, States } from '../core/types'
import { machine } from './machine'
import useAnimations from './useAnimations'
import useHotkey, { Hotkey } from './useHotkey'

export type RegisterButtonConfig = {
    button: DefaultOptionFields
    buttonComponent: JSX.Element
}

export type RegisterButton = (config: RegisterButtonConfig) => JSX.Element

export type Use2bttnsMachineConfig = {
    items: Item[]
    hotkeys: { [K in DefaultOptionFields]: Hotkey }
}

export default function use2bttnsMachine({
    items,
    hotkeys,
}: Use2bttnsMachineConfig) {
    const { variants, controls, animateVariant, animate } = useAnimations()

    const [current, send] = useMachine(machine)
    const [canPick, setCanPick] = useState(false)
    const canPickRef = useRef<boolean>(canPick)

    const handleButtonClick =
        (button: RegisterButtonConfig['button']) => async () => {
            if (!canPickRef.current) {
                console.error('PICK DISABLED')
                return
            }

            const otherButton: RegisterButtonConfig['button'] =
                button === 'first' ? 'second' : 'first'

            send({
                type: 'PICK_ITEM',
                args: { key: button },
            })
            await animate.beforeAll()
            await Promise.all([
                animate[button].onPickedPre(),
                animate[otherButton].onNotPickedPre(),
            ])

            send({ type: 'LOAD_NEXT_ITEMS', args: {} })

            await Promise.all([
                animate[button].onPickedPost(),
                animate[otherButton].onNotPickedPost(),
            ])
            await animate.afterAll(), send({ type: 'PICK_READY', args: {} })
        }

    const registerButton: RegisterButton = ({ button, buttonComponent }) => {
        return (
            <motion.div
                variants={variants}
                animate={controls[button]}
                onHoverStart={() => {
                    if (!canPick) return
                    animateVariant(button, 'focused')
                }}
                onHoverEnd={() => {
                    if (!canPick) return
                    animateVariant(button, 'initial')
                }}
                onTapStart={() => {
                    if (!canPick) return
                    animateVariant(button, 'tapping')
                }}
                onTapCancel={() => {
                    if (!canPick) return
                    animateVariant(button, 'initial')
                }}
                onClick={handleButtonClick(button)}
            >
                {buttonComponent}
            </motion.div>
        )
    }

    useEffect(() => {
        send({ type: 'INIT', args: { items } })
        send({ type: 'PICK_READY', args: {} })
    }, [])

    useEffect(() => {
        console.log(current.context)
        console.log(current.value)

        const isPickingState = (current.value as States) === 'picking'
        setCanPick(isPickingState)
        canPickRef.current = isPickingState
    }, [current.value])

    useHotkey({ hotkey: hotkeys.first, onPress: handleButtonClick('first') })
    useHotkey({
        hotkey: hotkeys.second,
        onPress: handleButtonClick('second'),
    })

    return {
        registerButton,
        current_options: current.context.current_options,
        isFinished: (current.value as States) === 'finished',
    }
}
