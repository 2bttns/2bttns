import { Button, Table, Tbody, Td, Thead, Tr, Text } from '@chakra-ui/react'
import { ListItemAttributes } from '../../../../db/models/ListItemModel'
import { ListItemField } from './ListByIdView'

export type ListItemsTableProps = {
    listItems: ListItemAttributes[]
    fields: ListItemField[]
    handleAddField: (field: ListItemField) => void
}

export default function ListItemsTable(props: ListItemsTableProps) {
    const { listItems, fields, handleAddField } = props
    return (
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
                                    `field${fields.length + 1}` as ListItemField
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
                                <Td key={`${item.id}-${field}`}>
                                    {item[field as keyof ListItemAttributes]}
                                </Td>
                            ))}
                        </Tr>
                    )
                })}
            </Tbody>
        </Table>
    )
}
