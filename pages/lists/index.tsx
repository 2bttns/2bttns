import {
    Box,
    Button,
    Code,
    Divider,
    Heading,
    List,
    ListItem,
    Stack,
    Tab,
    Table,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tbody,
    Td,
    Text,
    Thead,
    Tr,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { MouseEventHandler, useState } from 'react'
import { ListAttributes } from '../../db/models/ListModel'
import { getLists } from '../../lib/api/lists/client/getLists'

const Lists: NextPage = () => {
    const router = useRouter()

    // TODO: Create list
    // TODO: Edit list (e.g. name, description)
    // TODO: Add list items
    // TODO: Edit list items
    // TODO: Remove list items
    // TODO: Assign list to game
    // TODO: Dissociate from game

    const {
        data: lists,
        isLoading: listsLoading,
        error: listsError,
    } = useQuery({
        queryKey: ['lists'],
        queryFn: async () => {
            const data = await getLists()
            return data.lists
        },
    })

    const handleSelectList = (list: ListAttributes) => {
        router.push(`/lists?list_id=${list.id}`)
    }

    // TODO: Fetch list items using list_id
    const [listItems, setListItems] = useState([
        { name: 'List Item 1', field1: 'Value 1' },
        { name: 'List Item 2', field1: 'Value 2' },
        { name: 'List Item 3', field1: 'Value 3' },
    ])

    // TODO: Get list fields from fetched list items
    const [fields, setFields] = useState(['name', 'field1'])

    const handleAddField = (field: string) => {
        setFields([...fields, field])
        setListItems(
            listItems.map((item) => {
                return { ...item, [field]: '' }
            })
        )
    }

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

                    <Divider
                        orientation="horizontal"
                        sx={{ marginY: '1rem' }}
                    />

                    <Stack direction="row">
                        <Stack direction="column" flex={1} maxWidth="250px">
                            <Box>
                                <Text sx={{ fontWeight: 'bold' }}>
                                    Select List
                                </Text>
                            </Box>
                            {/* TODO: Highlight list name when selected */}
                            <List>
                                {lists?.map((list) => (
                                    <ListItem
                                        key={list.id}
                                        onClick={() => handleSelectList(list)}
                                        cursor="pointer"
                                    >
                                        {list.name}
                                    </ListItem>
                                ))}
                            </List>
                        </Stack>
                        <Stack direction="column" flex={3}>
                            <Box>
                                <Text sx={{ fontWeight: 'bold' }}>
                                    List Items
                                </Text>
                            </Box>
                            <Box
                                sx={{
                                    maxWidth: { base: '50vw', md: '75vw' },
                                    overflowX: 'scroll',
                                }}
                            >
                                <Tabs>
                                    <TabList>
                                        <Tab>Default View</Tab>
                                        <Tab>JSON View</Tab>
                                    </TabList>

                                    <TabPanels>
                                        <TabPanel>
                                            <Table variant="striped">
                                                <Thead>
                                                    <Tr>
                                                        {fields.map((field) => (
                                                            <Td key={field}>
                                                                <Text
                                                                    sx={{
                                                                        fontWeight:
                                                                            'bold',
                                                                    }}
                                                                >
                                                                    {field}
                                                                </Text>
                                                            </Td>
                                                        ))}
                                                        <Td>
                                                            <Button
                                                                onClick={() =>
                                                                    handleAddField(
                                                                        `field${
                                                                            fields.length +
                                                                            1
                                                                        }`
                                                                    )
                                                                }
                                                            >
                                                                Add Field
                                                            </Button>
                                                        </Td>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {listItems.map((item) => {
                                                        return (
                                                            <Tr key={item.name}>
                                                                {fields.map(
                                                                    (field) => (
                                                                        <Td
                                                                            key={
                                                                                field
                                                                            }
                                                                        >
                                                                            {
                                                                                item[
                                                                                    field as keyof typeof item
                                                                                ]
                                                                            }
                                                                        </Td>
                                                                    )
                                                                )}
                                                            </Tr>
                                                        )
                                                    })}
                                                </Tbody>
                                            </Table>
                                        </TabPanel>
                                        <TabPanel>
                                            {/* TODO: Use a library for displaying/editing JSON  */}
                                            <p>JSON HERE</p>
                                            <Code>
                                                {JSON.stringify(listItems)}
                                            </Code>
                                        </TabPanel>
                                    </TabPanels>
                                </Tabs>
                            </Box>
                        </Stack>
                    </Stack>
                </Box>
            </main>
        </Box>
    )
}

export default Lists
