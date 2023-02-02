import { Code, Heading, Stack, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import ClassicMode from '../../lib/2bttns/ClassicMode'
import { getGames } from '../../lib/api/games/client/getGames'

const Play: NextPage = () => {
    const router = useRouter()
    const gameId = router.query.game_id as string | undefined

    const redirectInvalidGame = () => {
        router.push('/404')
    }

    const {
        data: game,
        isLoading: isGameLoading,
        error: gameError,
    } = useQuery({
        retry: false,
        enabled: gameId !== undefined,
        queryKey: ['game', gameId],
        queryFn: async () => {
            const data = await getGames([gameId!])
            console.log(data)
            if (data.games.length === 0) {
                throw new Error('Game not found')
            }
            return data.games[0]
        },
        onError: (error) => {
            console.error(error)
            redirectInvalidGame()
        },
        onSuccess: (data) => {
            console.log(data)
        },
    })

    const items: { id: string }[] = 'abcde'.split('').map((n) => {
        return { id: n }
    })

    if (isGameLoading || gameError) {
        return <Text>Loading game...</Text>
    }

    return (
        <div>
            <Head>
                <title> {game?.name && `${game.name} | `}Play 2bttns</title>
                <meta
                    name="description"
                    content="You are now playing the 2bttns game."
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* TODO: swap out game modes if a frontend plugin is active for the game (e.g. Tinder-style) */}
            <Heading
                as="h1"
                sx={{
                    fontSize: '48px',
                    marginTop: '2rem',
                    textAlign: 'center',
                }}
            >
                {game?.name}
            </Heading>
            <ClassicMode
                items={items}
                hotkeys={{
                    first: ['w', 'ArrowUp'],
                    second: ['s', 'ArrowDown'],
                }}
            >
                {({ button1, button2, isFinished, context }) => {
                    return (
                        <Stack direction="column" alignItems="center">
                            <Text
                                as="h1"
                                sx={{
                                    fontSize: '32px',
                                    marginBottom: '2rem',
                                    marginTop: '2rem',
                                }}
                            >
                                {isFinished
                                    ? 'Round over!'
                                    : 'Which is more fun?'}
                            </Text>

                            {!isFinished && (
                                <>
                                    {button1}
                                    <Text
                                        sx={{
                                            textTransform: 'uppercase',
                                            padding: '1rem',
                                        }}
                                    >
                                        or
                                    </Text>
                                    {button2}
                                </>
                            )}

                            {isFinished && (
                                <Code
                                    sx={{
                                        textTransform: 'uppercase',
                                        padding: '1rem',
                                        width: '540px',
                                    }}
                                >
                                    {JSON.stringify(context.results, null, 2)}
                                </Code>
                            )}
                        </Stack>
                    )
                }}
            </ClassicMode>
        </div>
    )
}

export default Play
