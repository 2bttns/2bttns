import {
    Box,
    Button,
    Code,
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
import { useRouter } from 'next/router'
import { useState } from 'react'
import { getLists } from '../../../lib/api/lists/client/getLists'
import ListsLayout from '../ListsLayout'
const ListByIdPage: NextPage = () => {
    const router = useRouter()
    const { listId } = router.query as { listId: string }

    const redirectInvalidList = () => {
        router.push('/404')
    }

    const {
        data: list,
        isLoading: isListLoading,
        error: listError,
    } = useQuery({
        retry: false,
        enabled: listId !== undefined,
        queryKey: ['lists', listId],
        queryFn: async () => {
            const data = await getLists([listId!])
            if (data.lists.length === 0) {
                throw new Error('List not found')
            }
            return data.lists[0]
        },
        onError: (error) => {
            console.error(error)
            redirectInvalidList()
        },
    })

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

    const breadcrumbLabel = list ? `${list.name} (${list.id})` : ''

    return (
        <ListsLayout
            subtitle={list?.name}
            breadcrumbs={[{ label: breadcrumbLabel, href: '#' }]}
        >
            {isListLoading || listError ? (
                <Text>Loading list...</Text>
            ) : (
                <>
                    <Box>
                        <Text sx={{ fontWeight: 'bold' }}>List Items</Text>
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
                                                        {fields.map((field) => (
                                                            <Td key={field}>
                                                                {
                                                                    item[
                                                                        field as keyof typeof item
                                                                    ]
                                                                }
                                                            </Td>
                                                        ))}
                                                    </Tr>
                                                )
                                            })}
                                        </Tbody>
                                    </Table>
                                </TabPanel>
                                <TabPanel>
                                    {/* TODO: Use a library for displaying/editing JSON  */}
                                    <p>JSON HERE</p>
                                    <Code>{JSON.stringify(listItems)}</Code>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </Box>
                </>
            )}
        </ListsLayout>
    )
}

export default ListByIdPage
