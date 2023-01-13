import { useMutation, useQuery } from '@tanstack/react-query'
import ClassicButton, { ClassicButtonProps } from './ClassicButton'
import { Item, Results } from './types'
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
    // @TODO: Get input list based on game ID
    const { isLoading, isError, data, error } = useQuery({
        queryKey: ['lists'],
        queryFn: async () => {
            const response = await fetch('/api/lists')
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            return response.json()
        },
    })

    // @TODO: pass proper game_id and user_id
    const submitResultsMutation = useMutation({
        mutationFn: async (newResult: Results) => {
            const response = await fetch(`/api/games/${2}/round-results/${2}`, {
                method: 'POST',
                body: JSON.stringify(newResult),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            return response.json()
        },
    })

    const { registerButton, current_options, isFinished, context } =
        use2bttnsMachine({
            items,
            hotkeys,
            onFinish: async (results) => {
                try {
                    await submitResultsMutation.mutateAsync(results)
                } catch (error) {
                    console.error(error)
                }
            },
        })

    if (isLoading) {
        return <span>Loading...</span>
    }

    if (isError) {
        return <span>Error: {error instanceof Error && error.message}</span>
    }

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
