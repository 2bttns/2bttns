// Type for fields to display in the table for a list's list items

import { DeleteIcon } from '@chakra-ui/icons'
import {
    Box,
    Button,
    ButtonGroup,
    Code,
    Divider,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    Tooltip,
} from '@chakra-ui/react'
import { ListItemAttributes } from '../../../../db/models/ListItemModel'
import { ListAttributes } from '../../../../db/models/ListModel'
import {
    DEFAULT_LIST_DESCRIPTION,
    DEFAULT_LIST_NAME,
} from '../../../../lib/constants'
import CustomEditable from '../../../CustomEditable'
import ListsLayout from '../ListsLayout'
import ListItemsTable, { ListItemsTableProps } from './ListItemsTable'

// Users will be able to add fields
export type ListItemField = keyof ListItemAttributes & string

export type ListByIdViewProps = {
    list: ListAttributes | undefined
    listError?: Error | undefined
    isListLoading?: boolean
    handleListMetadataEdit: (
        field: 'name' | 'description',
        value: string
    ) => void
    handleDeleteList: (listId: string) => void
    breadcrumbLabel: string
    listItems: ListItemAttributes[]
    fields: ListItemField[]
    handleAddListItem: () => void
    handleAddField: (field: ListItemField) => void
    handleEditListItem: ListItemsTableProps['handleEditListItem']
}

export default function ListByIdView(props: ListByIdViewProps) {
    const {
        list,
        listError,
        isListLoading,
        handleListMetadataEdit,
        handleDeleteList,
        breadcrumbLabel,
        listItems,
        fields,
        handleAddListItem,
        handleAddField,
        handleEditListItem,
    } = props

    return (
        <ListsLayout
            subtitle={list?.name || DEFAULT_LIST_NAME}
            breadcrumbs={[{ label: breadcrumbLabel, href: '#' }]}
        >
            {isListLoading || listError || !list ? (
                <>
                    {isListLoading && <Text>Loading list...</Text>}
                    {!isListLoading && listError && (
                        <Text>Failed to load list.</Text>
                    )}
                </>
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
                                            handleDeleteList(list!.id)
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
                        }}
                    >
                        <Tabs>
                            <TabList>
                                <Tab>Default View</Tab>
                                <Tab>JSON View</Tab>
                            </TabList>

                            <TabPanels>
                                <TabPanel>
                                    <Stack direction="column">
                                        <ButtonGroup
                                            size="sm"
                                            sx={{ marginLeft: 'auto' }}
                                        >
                                            <Button
                                                onClick={handleAddListItem}
                                                colorScheme="blue"
                                            >
                                                Add Item
                                            </Button>
                                            {/* TODO: Add field */}
                                            {/* <Button
                                                variant="outline"
                                                colorScheme="blue"
                                                onClick={() =>
                                                    handleAddField(
                                                        `field${
                                                            fields.length + 1
                                                        }` as ListItemField
                                                    )
                                                }

                                            >
                                                Add Field
                                            </Button> */}
                                        </ButtonGroup>
                                        <Box
                                            sx={{
                                                maxHeight: '50vh',
                                                overflow: 'auto',
                                            }}
                                        >
                                            <ListItemsTable
                                                listItems={listItems}
                                                fields={fields}
                                                handleEditListItem={
                                                    handleEditListItem
                                                }
                                            />
                                        </Box>
                                    </Stack>
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
