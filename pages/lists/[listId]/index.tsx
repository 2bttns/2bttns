import { DeleteIcon } from '@chakra-ui/icons'
import {
    Box,
    Button,
    ButtonGroup,
    Code,
    Divider,
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
    Tooltip,
    Tr,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import CustomEditable from '../../../components/CustomEditable'
import { ListItemAttributes } from '../../../db/models/ListItemModel'
import { deleteList } from '../../../lib/api/lists/client/deleteList'
import { getLists } from '../../../lib/api/lists/client/getLists'
import {
    updateList,
    UpdateListParams,
} from '../../../lib/api/lists/client/updateList'
import {
    DEFAULT_LIST_DESCRIPTION,
    DEFAULT_LIST_NAME,
} from '../../../lib/constants'
import ListsLayout from '../ListsLayout'

// Type for fields to display in the table for a list's list items
// Users will be able to add fields
export type ListItemField = keyof ListItemAttributes & string

const ListByIdPage: NextPage = () => {
    const router = useRouter()
    const { listId } = router.query as { listId: string }

    const redirectInvalidList = () => {
        router.push('/404')
    }

    const [listItems, setListItems] = useState<ListItemAttributes[]>([])
    const [fields, setFields] = useState<ListItemField[]>([])

    const queryClient = useQueryClient()
    const {
        data: list,
        isLoading: isListLoading,
        error: listError,
    } = useQuery({
        retry: false,
        enabled: listId !== undefined,
        queryKey: ['lists', listId],
        queryFn: async () => {
            const data = await getLists({
                list_ids: [listId!],
                include_list_items: true,
            })
            if (data.lists.length === 0) {
                throw new Error('List not found')
            }
            return data.lists[0]
        },
        onError: (error) => {
            console.error(error)
            redirectInvalidList()
        },
        onSuccess: (list) => {
            setListItems(list?.list_items || [])

            const fields =
                list?.list_items && list.list_items.length > 0
                    ? (Object.keys(list.list_items[0]) as ListItemField[])
                    : []

            const fieldsWithoutDefaultFields = fields.filter(
                (field) =>
                    field !== 'id' &&
                    field !== 'list_id' &&
                    field !== 'description' &&
                    field !== 'name'
            )

            const fieldsWithDefaultFieldsFirst: ListItemField[] = [
                'name',
                'description',
                'id',
                'list_id',
                ...fieldsWithoutDefaultFields,
            ]

            setFields(fieldsWithDefaultFieldsFirst)
        },
    })

    const handleAddField = (field: string) => {
        setFields([...fields, field] as ListItemField[])
        setListItems(
            listItems.map((item) => {
                return { ...item, [field]: '' }
            })
        )
    }

    const { mutate: deleteListMutation } = useMutation(
        async (listId: string) => {
            const result = await deleteList({
                list_id: listId,
            })
            return result
        },
        {
            onSuccess: (result) => {
                router.push('/lists')
            },
            onError: (error) => {
                console.error(error)
            },
        }
    )

    const handleDeleteList = (listId: string) => {
        if (typeof window === 'undefined') return
        const confirm = window.confirm(
            'Please confirm that you want to delete this list. This action cannot be undone.'
        )
        if (!confirm) return
        deleteListMutation(listId)
    }

    const breadcrumbLabel = list
        ? `${list.name || DEFAULT_LIST_NAME} (${list.id})`
        : ''

    const { mutate: updateListMutation } = useMutation(
        async (body: UpdateListParams['body']) => {
            const result = await updateList({
                list_id: listId,
                body,
            })
            return result
        },
        {
            onSuccess: (result) => {
                queryClient.invalidateQueries(['lists', listId])
                queryClient.invalidateQueries(['lists'])
            },
            onError: (error) => {
                console.error(error)
            },
        }
    )

    const handleListMetadataEdit = (
        field: 'name' | 'description',
        value: string
    ) => {
        updateListMutation({
            [field]: value,
        })
    }

    return (
        <ListsLayout
            subtitle={list?.name || DEFAULT_LIST_NAME}
            breadcrumbs={[{ label: breadcrumbLabel, href: '#' }]}
        >
            {isListLoading || listError ? (
                <Text>Loading list...</Text>
            ) : (
                <>
                    <Stack
                        direction={{ base: 'column', md: 'row' }}
                        justifyContent={{ base: 'normal', md: 'space-between' }}
                    >
                        <Box sx={{ marginY: '0.5rem', flex: 5 }}>
                            <Text as="h1" sx={{ fontWeight: 'bold' }}>
                                Name:
                            </Text>
                            <CustomEditable
                                value={list?.name ?? ''}
                                placeholder={DEFAULT_LIST_NAME}
                                handleSave={(value) => {
                                    handleListMetadataEdit('name', value)
                                }}
                            />
                            <Text
                                as="h1"
                                sx={{ fontWeight: 'bold', marginTop: '0.5rem' }}
                            >
                                Description:
                            </Text>
                            <CustomEditable
                                value={list?.description ?? ''}
                                placeholder={DEFAULT_LIST_DESCRIPTION}
                                handleSave={(value) => {
                                    handleListMetadataEdit('description', value)
                                }}
                                isTextarea
                            />
                        </Box>
                        <Box sx={{ marginY: '0.5rem', flex: 1 }}>
                            <ButtonGroup>
                                <Tooltip
                                    label="Delete this list"
                                    aria-label="Delete this list"
                                >
                                    <Button
                                        colorScheme="red"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            handleDeleteList(listId)
                                        }}
                                    >
                                        <DeleteIcon />
                                    </Button>
                                </Tooltip>
                            </ButtonGroup>
                        </Box>
                    </Stack>
                    <Divider />
                    <Text sx={{ fontWeight: 'bold' }}>List Items</Text>
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
                                                            <Td
                                                                key={`${item.id}-${field}`}
                                                            >
                                                                {
                                                                    item[
                                                                        field as keyof ListItemAttributes
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
