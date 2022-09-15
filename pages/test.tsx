import type { InferGetServerSidePropsType, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import ListItemModel from '../db/models/example/ListItemModel'
import ListModel from '../db/models/example/ListModel'
import UserModel from '../db/models/example/UserModel'
import styles from '../styles/Home.module.css'

export const getServerSideProps = async () => {
    try {
        const users = await UserModel.findAll({ raw: true })

        let id = "10d7260e-142d-4d0e-8737-8ca9cef151ac"
        if (id) {
            await ListModel.destroy({where: {id}})
        }

        const lists = await ListModel.findAll({
            raw: true,
            include: [{ model: ListItemModel, attributes: ['id', 'name'] }],
        })

        const listItems = await ListItemModel.findAll({ raw: true })

        return {
            props: {
                users,
                lists,
                listItems,
            },
        }
    } catch (error) {
        console.error(error)
        return {
            props: {
                users: [],
            },
        }
    }
}

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (
    props
) => {
    const { users, lists, listItems } = props

    console.log(props)

    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Welcome to <a href="https://nextjs.org">Next.js!</a>
                </h1>

                <h2>Sequelize with SQLite setup</h2>
                {JSON.stringify(lists)}

                {users.length > 0 ? (
                    <ul>
                        {users.map((u) => {
                            return <li key={u.id}>{JSON.stringify(u)}</li>
                        })}
                    </ul>
                ) : (
                    <p>No Users Found.</p>
                )}

                <p className={styles.description}>
                    Get started by editing{' '}
                    <code className={styles.code}>pages/index.tsx</code>
                </p>

                <div className={styles.grid}>
                    <a href="https://nextjs.org/docs" className={styles.card}>
                        <h2>Documentation &rarr;</h2>
                        <p>
                            Find in-depth information about Next.js features and
                            API.
                        </p>
                    </a>

                    <a href="https://nextjs.org/learn" className={styles.card}>
                        <h2>Learn &rarr;</h2>
                        <p>
                            Learn about Next.js in an interactive course with
                            quizzes!
                        </p>
                    </a>

                    <a
                        href="https://github.com/vercel/next.js/tree/canary/examples"
                        className={styles.card}
                    >
                        <h2>Examples &rarr;</h2>
                        <p>
                            Discover and deploy boilerplate example Next.js
                            projects.
                        </p>
                    </a>

                    <a
                        href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                        className={styles.card}
                    >
                        <h2>Deploy &rarr;</h2>
                        <p>
                            Instantly deploy your Next.js site to a public URL
                            with Vercel.
                        </p>
                    </a>
                </div>
            </main>

            <footer className={styles.footer}>
                <a
                    href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by{' '}
                    <span className={styles.logo}>
                        <Image
                            src="/vercel.svg"
                            alt="Vercel Logo"
                            width={72}
                            height={16}
                        />
                    </span>
                </a>
            </footer>
        </div>
    )
}

export default Home
