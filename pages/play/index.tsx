import type { NextPage } from 'next'
import Head from 'next/head'
import ClassicMode from '../../lib/2bttns/ClassicMode'

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

            <ClassicMode items={activities} />
        </div>
    )
}

export default Play
