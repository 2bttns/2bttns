import { DeleteIcon } from '@chakra-ui/icons'
import { IconButton, Table, Tbody, Td, Text, Thead, Tr } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { ListItemAttributes } from '../../../../db/models/ListItemModel'
import EditableTd from '../../../EditableTd'
import { ListItemField } from './ListByIdView'

export type ListItemsTableProps = {
    listItems: ListItemAttributes[]
    fields: ListItemField[]
    handleEditListItem: (
        item: ListItemAttributes,
        field: string,
        value: ListItemAttributes[keyof ListItemAttributes]
    ) => void
    handleDeleteListItem: (item: ListItemAttributes) => void
}

export default function ListItemsTable(props: ListItemsTableProps) {
    const { listItems, fields, handleEditListItem, handleDeleteListItem } =
        props

    const [viewListItems, setViewListItems] = useState<ListItemAttributes[]>([])

    useEffect(() => {
        setViewListItems(listItems)
    }, [listItems])

    // TODO: Sort asc/desc by field
    // const sortListItems = (field: ListItemField, order: 'asc' | 'desc') => {
    //     const sortedListItems = [...viewListItems].sort((a, b) => {
    //         if (a[field] < b[field]) {
    //             return -1
    //         }
    //         if (a[field] > b[field]) {
    //             return 1
    //         }
    //         return 0
    //     })
    //     setViewListItems(sortedListItems)
    // }

    return (
        <Table variant="striped">
            <Thead
                sx={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white',
                    boxShadow: '0 4px 4px rgba(0, 0, 0, 0.1)',
                    zIndex: 1,
                }}
            >
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
                </Tr>
            </Thead>
            <Tbody>
                {viewListItems.map((item) => {
                    return (
                        <Tr key={item.id}>
                            {fields.map((f) => {
                                const field = f as keyof ListItemAttributes
                                const value = item[field]

                                const placeholder = `No ${field}`

                                return (
                                    <EditableTd
                                        key={`${item.id}-${field}`}
                                        placeholder={placeholder}
                                        value={value ?? ''}
                                        handleSave={(newValue) =>
                                            handleEditListItem(
                                                item,
                                                field,
                                                newValue
                                            )
                                        }
                                        sx={{
                                            minWidth: '400px',
                                        }}
                                    />
                                )
                            })}
                            <Td>
                                <IconButton
                                    aria-label="Delete list item"
                                    icon={<DeleteIcon />}
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleDeleteListItem(item)}
                                />
                            </Td>
                        </Tr>
                    )
                })}
            </Tbody>
        </Table>
    )
}
