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

            <ClassicMode items={items} />
        </div>
    )
}

export default Play
