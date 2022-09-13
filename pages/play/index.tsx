import { Code, Stack, Text } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import ClassicMode from '../../lib/2bttns/ClassicMode'

const Play: NextPage = () => {
    const items: { id: string }[] = 'abcdefghijklmnopqrstuvwxyz'
        .split('')
        .map((n) => {
            return { id: n }
        })

    return (
        <div>
            <Head>
                <title>Play 2bttns</title>
                <meta
                    name="description"
                    content="You are now playing the 2bttns game."
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

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
