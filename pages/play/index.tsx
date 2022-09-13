import { Stack, Text } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import Onboarding2bttnsButton from '../../components/Onboarding2bttnsButton'
import FramerMotionAnimatedTwoBttns from '../../lib/2bttns-classic/react/animated/framer-motion/FramerMotionAnimatedTwoBttns'
import TwoBttnsRound from '../../lib/2bttns-classic/react/TwoBttnsRound'
import { BttnConfig } from '../../lib/2bttns-classic/react/TwoBttnsRound/types'

const Play: NextPage = () => {
    const activities: { id: string }[] = '1234567890'.split('').map((n) => {
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

            <FramerMotionAnimatedTwoBttns>
                {({ bttnConfig, renderButton }) => {
                    const bttnConfigOverride: BttnConfig = {
                        ...bttnConfig,
                        bttn1: {
                            ...bttnConfig.bttn1,
                            hotkey: ['w', 'ArrowUp'],
                        },
                        bttn2: {
                            ...bttnConfig.bttn2,
                            hotkey: ['s', 'ArrowDown'],
                        },
                    }

                    return (
                        <TwoBttnsRound<typeof activities[0]>
                            items={activities}
                            handleRoundEnd={(results) => {
                                console.log(results)
                            }}
                            bttnConfig={bttnConfigOverride}
                        >
                            {({
                                bttn1Item,
                                bttn2Item,
                                handleBttnClick,
                                roundOver,
                                pickDisabled,
                            }) => (
                                <Stack alignItems="center">
                                    {!roundOver ? (
                                        <>
                                            <Text
                                                as="h1"
                                                sx={{
                                                    fontSize: '32px',
                                                    marginBottom: '2rem',
                                                }}
                                            >
                                                Which is more fun?
                                            </Text>

                                            {renderButton({
                                                button: 1,
                                                buttonComponent: (
                                                    <Onboarding2bttnsButton
                                                        onClick={handleBttnClick(
                                                            1
                                                        )}
                                                        hotkey={
                                                            bttnConfigOverride!
                                                                .bttn1!
                                                                .hotkey![0]
                                                        }
                                                    >
                                                        {bttn1Item?.id ?? ''}
                                                    </Onboarding2bttnsButton>
                                                ),
                                                pickDisabled,
                                            })}

                                            <Text
                                                sx={{
                                                    textTransform: 'uppercase',
                                                    padding: '1rem',
                                                }}
                                            >
                                                or
                                            </Text>

                                            {renderButton({
                                                button: 2,
                                                buttonComponent: (
                                                    <Onboarding2bttnsButton
                                                        onClick={handleBttnClick(
                                                            2
                                                        )}
                                                        hotkey={
                                                            bttnConfigOverride!
                                                                .bttn2!
                                                                .hotkey![0]
                                                        }
                                                    >
                                                        {bttn2Item?.id ?? ''}
                                                    </Onboarding2bttnsButton>
                                                ),
                                                pickDisabled,
                                            })}
                                        </>
                                    ) : (
                                        <>Round over!</>
                                    )}
                                </Stack>
                            )}
                        </TwoBttnsRound>
                    )
                }}
            </FramerMotionAnimatedTwoBttns>
        </div>
    )
}

export default Play
