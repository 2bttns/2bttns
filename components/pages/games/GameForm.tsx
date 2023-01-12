import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Text,
    Textarea,
} from '@chakra-ui/react'
import { useState } from 'react'

export type GameFormProps = {
    onSubmit: (values: GameFormValues) => void
}

export type GameFormValues = {
    name: string
    description: string
    plugins: string
}

export default function GameForm(props: GameFormProps) {
    const { onSubmit } = props

    const [name, setName] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [plugins, setPlugins] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!name || !description || !plugins) {
            setErrorMessage('All fields are required')
            return
        }
        setErrorMessage('')

        onSubmit({ description, name, plugins })
    }

    return (
        <form onSubmit={handleSubmit}>
            <FormControl>
                <FormLabel htmlFor="name">Name</FormLabel>
                <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
            </FormControl>
            <FormControl>
                <FormLabel htmlFor="description">Description</FormLabel>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
            </FormControl>
            <FormControl>
                <FormLabel htmlFor="plugins">
                    Plugins (comma-separated list)
                </FormLabel>
                <Input
                    id="plugins"
                    type="text"
                    value={plugins}
                    onChange={(event) => setPlugins(event.target.value)}
                />
            </FormControl>

            {errorMessage && <Text color="red.500">{errorMessage}</Text>}
            <Box sx={{ paddingY: '1rem' }}>
                <Button
                    sx={{ width: '100%' }}
                    colorScheme="blue"
                    size="lg"
                    type="submit"
                >
                    Create Game
                </Button>
            </Box>
        </form>
    )
}
