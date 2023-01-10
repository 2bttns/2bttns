import { Box, Button, Divider, Heading, Stack } from '@chakra-ui/react'
import Head from 'next/head'
import Link from 'next/link'
import {
    GameAttributes,
    GameCreationAttributes,
} from '../../../db/models/GameModel'
import GameForm, { GameFormProps } from './GameForm'
import GamesTable from './GamesTable'

export type GamesViewProps = {
    games?: GameAttributes[]
    handleCreateGame: GameFormProps['onSubmit']
    handleDeleteGame: (gameId: string) => void
    handleEditGame: (
        gameId: string,
        updated: Omit<GameAttributes, 'id'>
    ) => void
}

export default function GamesView(props: GamesViewProps) {
    const { games, handleCreateGame, handleDeleteGame, handleEditGame } = props
    return (
        <Box sx={{ padding: '1rem', backgroundColor: '#ddd' }}>
            <Head>
                <title>My Games</title>
                <meta name="description" content="My 2bttns Games" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
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
                    <GameForm onSubmit={handleCreateGame} />
                </Box>

                <Divider orientation="horizontal" sx={{ paddingY: '1rem' }} />

                <Box sx={{ backgroundColor: '#fff', padding: '1rem' }}>
                    <Heading as="h1" size="2xl">
                        My Games
                    </Heading>
                    {games && (
                        <GamesTable
                            onFieldEdited={(field, newValue, game) => {
                                const updated = {
                                    ...game,
                                    [field]: newValue,
                                } as GameAttributes

                                console.log(updated)
                            }}
                            games={games}
                            renderActions={(game) => {
                                return (
                                    <Stack direction="row">
                                        <Link
                                            href={`/play?id=${game.id}`}
                                            passHref
                                        >
                                            <Button as="a" colorScheme="green">
                                                Play
                                            </Button>
                                        </Link>
                                        <Button
                                            as="a"
                                            colorScheme="red"
                                            onClick={() =>
                                                handleDeleteGame(game.id)
                                            }
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            as="a"
                                            colorScheme="blue"
                                            onClick={() => {
                                                const {
                                                    id,
                                                    ...editableFields
                                                } = game
                                                handleEditGame(
                                                    game.id,
                                                    editableFields
                                                )
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    </Stack>
                                )
                            }}
                        />
                    )}
                </Box>
            </main>
        </Box>
    )
}
