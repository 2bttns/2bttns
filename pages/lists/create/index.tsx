import { Box, Text } from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import ListsLayout from '../ListsLayout'
const Lists: NextPage = () => {
    const router = useRouter()

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
                <h1>FORM</h1>
            </Box>
        </ListsLayout>
    )
}

export default Lists
