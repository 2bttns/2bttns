import { Stack } from '@chakra-ui/react'
import ClassicButton from './ClassicButton'
import { Item } from './types'
import use2bttnsMachine, { Use2bttnsMachineConfig } from './use2bttnsMachine'

export type ClassicModeProps = {
    items: Item[]
    hotkeys?: Use2bttnsMachineConfig['hotkeys']
}

export default function ClassicMode({ items, hotkeys }: ClassicModeProps) {
    const { registerButton, current_options, isFinished } = use2bttnsMachine({
        items,
        hotkeys,
        onFinish: async (results) => {
            console.log(results)
        },
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
                        <ClassicButton hotkey={hotkeys?.first[0]}>
                            {current_options.first?.id || ''}
                        </ClassicButton>
                    ),
                })}
                {registerButton({
                    button: 'second',
                    buttonComponent: (
                        <ClassicButton hotkey={hotkeys?.second[0]}>
                            {current_options.second?.id || ''}
                        </ClassicButton>
                    ),
                })}
            </Stack>
        </Stack>
    )
}
