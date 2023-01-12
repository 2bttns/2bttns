import { Box, Button, Divider, Heading, Stack } from '@chakra-ui/react'
import Head from 'next/head'
import Link from 'next/link'
import { GameAttributes } from '../../../db/models/GameModel'
import GameForm, { GameFormProps } from './GameForm'
import GamesTable, { GamesTableProps } from './GamesTable'

export type GamesViewProps = {
    games?: GameAttributes[]
    handleCreateGame: GameFormProps['onSubmit']
    handleDeleteGame: (gameId: string) => void
    handleFieldEdited: GamesTableProps['onFieldEdited']
}

export default function GamesView(props: GamesViewProps) {
    const { games, handleCreateGame, handleDeleteGame, handleFieldEdited } =
        props
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
                            onFieldEdited={handleFieldEdited}
                            games={games}
                            renderActions={(game) => {
                                return (
                                    <Stack direction="row">
                                        <Link
                                            href={`/play?game_id=${game.id}`}
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
