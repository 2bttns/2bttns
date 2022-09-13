import { Stack } from '@chakra-ui/react'
import { Item } from '../core/twobttns.machine'
import ClassicButton from './ClassicButton'
import use2bttnsMachine, { Use2bttnsMachineConfig } from './use2bttnsMachine'

export type ClassicModeProps = { items: Item[] }

export default function ClassicMode({ items }: ClassicModeProps) {
    const hotkeys: Use2bttnsMachineConfig['hotkeys'] = {
        first: ['w', 'ArrowUp'],
        second: ['s', 'ArrowDown'],
    }

    const { registerButton, current_options, isFinished } = use2bttnsMachine({
        items,
        hotkeys,
    })

    if (isFinished) {
        return <p>DONE</p>
    }

    return (
        <Stack direction="column" alignItems="center">
            <Stack direction="column">
                {registerButton({
                    button: 'first',
                    buttonComponent: (
                        <ClassicButton hotkey={hotkeys.first[0]}>
                            {current_options.first?.id || ''}
                        </ClassicButton>
                    ),
                })}
                {registerButton({
                    button: 'second',
                    buttonComponent: (
                        <ClassicButton hotkey={hotkeys.second[0]}>
                            {current_options.second?.id || ''}
                        </ClassicButton>
                    ),
                })}
            </Stack>
        </Stack>
    )
}
