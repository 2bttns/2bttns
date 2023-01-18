import { ButtonProps } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { ListAttributes } from '../../../../db/models/ListModel'
import { getLists } from '../../../../lib/api/lists/client/getLists'
import ListsLayoutView from './ListsLayoutView'

export type ListsLayoutProps = {
    children: React.ReactNode
    subtitle?: string
    breadcrumbs?: BreadcrumbItem[]
    createListsButtonProps?: ButtonProps
}

export type BreadcrumbItem = {
    label: string
    href: string
}

export default function ListsLayout(props: ListsLayoutProps) {
    const { children, subtitle, breadcrumbs, createListsButtonProps } = props
    const router = useRouter()

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
        router.push(`/lists/${list.id}`)
    }

    const currentListId = router.query.listId as string | undefined

    return (
        <ListsLayoutView
            children={children}
            subtitle={subtitle}
            lists={lists}
            currentListId={currentListId}
            handleSelectList={handleSelectList}
            listsLoading={listsLoading}
            listsError={listsError as Error | undefined}
            breadcrumbs={breadcrumbs}
            createListsButtonProps={createListsButtonProps}
        />
    )
}
