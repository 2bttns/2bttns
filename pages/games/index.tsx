import { Box, Button, Divider, Heading } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useMutation, useQuery } from 'react-query'
import GameForm, { GameFormValues } from '../../components/pages/games/GameForm'
import GamesTable from '../../components/pages/games/GamesTable'
import createGame from '../../lib/api/games/client/createGame'
import { getGames } from '../../lib/api/games/client/getGames'

const Games: NextPage = () => {
    const gamesQuery = useQuery('games', () => {
        return getGames()
    })
    const games = gamesQuery?.data?.games
    const hasGames = games && games.length > 0

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

                <Divider orientation="horizontal" sx={{ paddingY: '1rem' }} />

                <Box sx={{ backgroundColor: '#fff', padding: '1rem' }}>
                    <Heading as="h1" size="2xl">
                        My Games
                    </Heading>
                    {games && (
                        <GamesTable
                            games={games}
                            renderActions={(game) => {
                                return (
                                    <Link href={`/play?id=${game.id}`} passHref>
                                        <Button as="a" colorScheme="blue">
                                            Play
                                        </Button>
                                    </Link>
                                )
                            }}
                        />
                    )}
                </Box>
            </main>
        </Box>
    )
}

export default Games
