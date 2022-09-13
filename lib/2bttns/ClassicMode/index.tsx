import ClassicButton, { ClassicButtonProps } from './ClassicButton'
import { Item } from './types'
import use2bttnsMachine, { Use2bttnsMachineConfig } from './use2bttnsMachine'

export type RenderPropParams = {
    button1: React.ReactNode
    button2: React.ReactNode
    context: ReturnType<typeof use2bttnsMachine>['context']
    isFinished: ReturnType<typeof use2bttnsMachine>['isFinished']
}

export type ClassicModeProps = {
    items: Item[]
    children: (params: RenderPropParams) => JSX.Element
    hotkeys?: Use2bttnsMachineConfig['hotkeys']
    button1Props?: Partial<ClassicButtonProps>
    button2Props?: Partial<ClassicButtonProps>
}

export default function ClassicMode({
    items,
    hotkeys,
    children,
    button1Props,
    button2Props,
}: ClassicModeProps) {
    const { registerButton, current_options, isFinished, context } =
        use2bttnsMachine({
            items,
            hotkeys,
            onFinish: async (results) => {
                console.log(results)
            },
        })

    return children({
        button1: registerButton({
            button: 'first',
            buttonComponent: (
                <ClassicButton hotkey={hotkeys?.first[0]} {...button1Props}>
                    {current_options.first?.id || ''}
                </ClassicButton>
            ),
        }),
        button2: registerButton({
            button: 'second',
            buttonComponent: (
                <ClassicButton hotkey={hotkeys?.second[0]} {...button2Props}>
                    {current_options.second?.id || ''}
                </ClassicButton>
            ),
        }),
        context,
        isFinished,
    })
}
