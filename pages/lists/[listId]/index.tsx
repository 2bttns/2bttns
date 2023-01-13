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
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import ListsLayout from '../ListsLayout'
const ListByIdPage: NextPage = () => {
    const router = useRouter()

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
        <ListsLayout
            subtitle="List By ID"
            breadcrumbs={[{ label: 'LIST NAME HERE', href: '#' }]}
        >
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
                                                        fontWeight: 'bold',
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
                                                            fields.length + 1
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
        </ListsLayout>
    )
}

export default ListByIdPage
