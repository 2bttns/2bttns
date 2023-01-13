import {
    Box,
    Button,
    Divider,
    Heading,
    List,
    ListItem,
    SimpleGrid,
    Stack,
    Table,
    Tbody,
    Td,
    Thead,
    Tr,
} from '@chakra-ui/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { MouseEventHandler, useState } from 'react'

const Lists: NextPage = () => {
    const router = useRouter()

    // TODO: Create list
    // TODO: Edit list (e.g. name, description)
    // TODO: Add list items
    // TODO: Edit list items
    // TODO: Remove list items
    // TODO: Assign list to game
    // TODO: Dissociate from game

    const handleClick: MouseEventHandler<HTMLLIElement> = (item) => {
        console.log('item clicked: ', item.currentTarget.innerText)
        router.push(`/lists?list_id=${item.currentTarget.innerText}`)
    }

    const items = ['Item 1', 'Item 2', 'Item 3']

    return (
        <Box sx={{ padding: '1rem', backgroundColor: '#ddd' }}>
            <Head>
                <title>My Lists</title>
                <meta name="description" content="My 2bttns Lists" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Divider orientation="horizontal" sx={{ paddingY: '1rem' }} />

                <Box sx={{ backgroundColor: '#fff', padding: '1rem' }}>
                    <Heading as="h1" size="2xl">
                        My Lists
                    </Heading>

                    <Stack direction="row">
                        <Stack direction="column" flex={1} maxWidth="250px">
                            <Box>Lists</Box>
                            <List>
                                {items.map((item) => (
                                    <ListItem
                                        key={item}
                                        onClick={handleClick}
                                        cursor="pointer"
                                    >
                                        {item}
                                    </ListItem>
                                ))}
                            </List>
                        </Stack>
                        <Stack direction="column" flex={3}>
                            <Box>List Items</Box>
                        </Stack>
                    </Stack>
                </Box>
            </main>
        </Box>
    )
}

export default Lists
