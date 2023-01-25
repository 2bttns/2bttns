import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import ListByIdView, {
    ListByIdViewProps,
} from '../../../components/pages/lists/[listId]/ListByIdView'
import { ListItemAttributes } from '../../../db/models/ListItemModel'
import {
    AddListItemParams,
    addListItems,
} from '../../../lib/api/lists/client/addListItem'
import { deleteList } from '../../../lib/api/lists/client/deleteList'
import { getLists } from '../../../lib/api/lists/client/getLists'
import {
    updateList,
    UpdateListParams,
} from '../../../lib/api/lists/client/updateList'
import {
    updateListItems,
    UpdateListItemsParams,
} from '../../../lib/api/lists/client/updateListItems'
import { DEFAULT_LIST_NAME } from '../../../lib/constants'

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

            const fieldsToHide = ['id', 'list_id']
            const withFieldsHidden = fieldsWithDefaultFieldsFirst.filter(
                (field) => !fieldsToHide.includes(field)
            )

            setFields(withFieldsHidden)
        },
    })

    const handleAddField: ListByIdViewProps['handleAddField'] = (field) => {
        setFields([...fields, field] as ListItemField[])
        setListItems(
            listItems.map((item) => {
                return { ...item, [field]: '' }
            })
        )
    }

    const { mutate: addNewListItemMutation } = useMutation({
        mutationFn: async (params: AddListItemParams) => {
            const response = await addListItems(params)
            return response
        },
    })

    const handleAddListItem: ListByIdViewProps['handleAddListItem'] = () => {
        // Adds a new empty list item to the list
        // The user will be able to edit the list item's fields directly via the ListItemsTable component
        addNewListItemMutation({
            listId,
            listItems: [{ name: '' }],
        })
        queryClient.invalidateQueries(['lists', listId])
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
                window.alert('List deleted successfully')
            },
            onError: (error) => {
                console.error(error)
            },
        }
    )

    const handleDeleteList: ListByIdViewProps['handleDeleteList'] = (
        listId
    ) => {
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

    const handleListMetadataEdit: ListByIdViewProps['handleListMetadataEdit'] =
        (field, value) => {
            updateListMutation({
                [field]: value,
            })
        }

    const { mutate: updateListItemsMutation } = useMutation({
        mutationFn: async (params: UpdateListItemsParams) => {
            const response = await updateListItems(params)
            return response
        },
    })

    const handleEditListItem: ListByIdViewProps['handleEditListItem'] = (
        listItem,
        field,
        value
    ) => {
        updateListItemsMutation({
            list_id: listItem.list_id,
            list_item_ids: [listItem.id],
            body: {
                [field]: value,
            },
        })
    }

    return (
        <ListByIdView
            list={list!}
            isListLoading={isListLoading}
            listError={listError as Error | undefined}
            listItems={listItems}
            fields={fields}
            handleAddListItem={handleAddListItem}
            handleAddField={handleAddField}
            handleEditListItem={handleEditListItem}
            handleDeleteList={handleDeleteList}
            handleListMetadataEdit={handleListMetadataEdit}
            breadcrumbLabel={breadcrumbLabel}
        />
    )
}

export default ListByIdPage
