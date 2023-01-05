import {
    Box,
    Button,
    Divider,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Heading,
    Input,
    Select,
    Text,
    Textarea,
} from '@chakra-ui/react'
import type { InferGetServerSidePropsType, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import { UserModel, ListModel, ListItemModel } from '../../db'
import { ListItemAttributes } from '../../db/models/ListItemModel'

export const getServerSideProps = async () => {
    try {
        const users = await UserModel.findAll({ raw: true })

        const list = (
            await ListModel.create(
                {
                    name: 'Activities',
                    list_items: [
                        { name: 'Jiu Jitsu' },
                        { name: 'Bowling' },
                        { name: 'Creating Art with AI' },
                    ],
                },
                { include: [ListItemModel] }
            )
        ).toJSON()

        const listItemAttrs: (keyof ListItemAttributes)[] = ['name']
        const lists = await ListModel.findAll({
            include: [
                {
                    model: ListItemModel,
                    attributes: listItemAttrs,
                },
            ],
            nest: true,
        })

        const listItems = await ListItemModel.findAll({ raw: true })

        return {
            props: {
                users,
                lists: lists.map((l) => {
                    const json = l.toJSON()
                    return json
                }),
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

const Games: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
    const { users, lists, listItems } = props

    console.log(props)

    return (
        // TODO: Style this page
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
                        <Select id="select-game">
                            {/* TODO: Use real games from API */}
                            {[1, 2, 3].map((game) => {
                                return (
                                    <option key={game} value={game}>
                                        {game}
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
                    <GameForm onSubmit={(values) => console.log(values)} />
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
    plugins: string[]
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
            return
        }

        // TODO: Fancy Formik validation

        // submit the form
        onSubmit({ description, name, plugins: plugins.split(',') })
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
            {errorMessage && (
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
            )}
            <Box sx={{ paddingY: '1rem' }}>
                <Button sx={{ width: '100%' }} colorScheme="blue" size="lg">
                    Create Game
                </Button>
            </Box>
        </form>
    )
}
