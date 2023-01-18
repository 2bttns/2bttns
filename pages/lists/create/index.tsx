import { Box, Text } from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { NextPage } from 'next'
import CreateListForm from '../../../components/pages/lists/CreateListForm'
import {
    createList,
    CreateListParams,
} from '../../../lib/api/lists/client/createList'
import ListsLayout from '../../../components/pages/lists/ListsLayout'
const Lists: NextPage = () => {
    const queryClient = useQueryClient()
    const { mutate: createListMutation } = useMutation(
        async (body: CreateListParams['body']) => {
            const results = await createList({ body })
            return results.result
        }
    )

    return (
        <ListsLayout
            subtitle="Create New List"
            breadcrumbs={[{ label: 'Create New List', href: '#∏' }]}
            createListsButtonProps={{ disabled: true }}
        >
            <Box>
                <Text sx={{ fontWeight: 'bold' }}>Create List</Text>
            </Box>
            <Box
                sx={{
                    maxWidth: { base: '50vw', md: '75vw' },
                    overflowX: 'scroll',
                }}
            >
                <CreateListForm
                    onSubmit={async (values, onSuccess) => {
                        createListMutation(values, {
                            onSuccess: (result) => {
                                queryClient.invalidateQueries(['lists'])
                                onSuccess()
                            },
                        })
                    }}
                />
            </Box>
        </ListsLayout>
    )
}

export default Lists
