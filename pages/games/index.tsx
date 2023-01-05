import {
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Select,
    Text,
    Textarea,
} from '@chakra-ui/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import createGame from '../../lib/api/games/client/createGame'
import { getGames } from '../../lib/api/games/client/getGames'

const Games: NextPage = () => {
    const gamesQuery = useQuery('games', () => {
        return getGames()
    })
    const games = gamesQuery?.data?.games
    const hasGames = games && games.length > 0
    console.log('Games', games)

    // React query mutation to create a game
    const { mutate: createGameMutation } = useMutation(
        (values: GameFormValues) => {
            return createGame(values)
        },
        {
            onSuccess: (data) => {
                console.log('Game created', data)
                gamesQuery.refetch()
            },
        }
    )

    return (
        <Box sx={{ padding: '1rem', backgroundColor: '#ddd' }}>
            <Head>
                <title>My Games</title>
                <meta name="description" content="My 2bttns Games" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Box sx={{ backgroundColor: '#fff', padding: '1rem' }}>
                    <Heading as="h1" size="2xl">
                        My Games
                    </Heading>
                    <FormControl>
                        <FormLabel htmlFor="select-game">Select Game</FormLabel>
                        <Select
                            id="select-game"
                            disabled={!hasGames}
                            placeholder={
                                hasGames ? 'Select a game' : 'No games found'
                            }
                        >
                            {games?.map((game) => {
                                return (
                                    <option key={game.id} value={game.name}>
                                        {game.name}
                                    </option>
                                )
                            })}
                        </Select>
                    </FormControl>
                    <Box sx={{ paddingY: '1rem' }}>
                        <Button
                            sx={{ width: '100%' }}
                            colorScheme="blue"
                            size="lg"
                        >
                            Play
                        </Button>
                    </Box>
                </Box>

                <Divider orientation="horizontal" sx={{ paddingY: '1rem' }} />

                <Box
                    sx={{
                        paddingTop: '1rem',
                        backgroundColor: '#fff',
                        padding: '1rem',
                    }}
                >
                    <Heading as="h2" size="xl">
                        Create a Game
                    </Heading>
                    <GameForm
                        onSubmit={(values) => {
                            console.log('Submitting game', values)
                            createGameMutation(values)
                        }}
                    />
                </Box>
            </main>
        </Box>
    )
}

export default Games

export type GameFormProps = {
    onSubmit: (values: GameFormValues) => void
}

export type GameFormValues = {
    name: string
    description: string
    plugins: string
}

function GameForm(props: GameFormProps) {
    const { onSubmit } = props

    const [name, setName] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [plugins, setPlugins] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!name || !description || !plugins) {
            setErrorMessage('All fields are required')
            console.log('All fields are required')
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
