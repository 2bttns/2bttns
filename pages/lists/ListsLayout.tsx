import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    ButtonProps,
    Divider,
    Heading,
    List,
    ListItem,
    Stack,
    Text,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ListAttributes } from '../../db/models/ListModel'
import { getLists } from '../../lib/api/lists/client/getLists'

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

    return (
        <Box sx={{ padding: '1rem', backgroundColor: '#ddd' }}>
            <Head>
                <title>{subtitle ? `${subtitle} | ` : ''}My Lists</title>
                <meta name="description" content="My 2bttns Lists" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Divider orientation="horizontal" sx={{ paddingY: '1rem' }} />

                <Box sx={{ backgroundColor: '#fff', padding: '1rem' }}>
                    <Heading as="h1" size="md">
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link href="/lists">
                                    <BreadcrumbLink
                                        isCurrentPage={
                                            router.asPath === '/lists'
                                        }
                                    >
                                        My Lists
                                    </BreadcrumbLink>
                                </Link>
                            </BreadcrumbItem>
                            {breadcrumbs?.map((breadcrumb) => {
                                return (
                                    <BreadcrumbItem
                                        key={breadcrumb.href}
                                        isCurrentPage={
                                            router.asPath === breadcrumb.href
                                        }
                                    >
                                        <Link href={breadcrumb.href}>
                                            <BreadcrumbLink>
                                                {breadcrumb.label}
                                            </BreadcrumbLink>
                                        </Link>
                                    </BreadcrumbItem>
                                )
                            })}
                        </Breadcrumb>
                    </Heading>

                    <Divider
                        orientation="horizontal"
                        sx={{ marginY: '1rem' }}
                    />

                    <Stack direction="row">
                        <Stack
                            direction="column"
                            flex={1}
                            maxWidth="250px"
                            paddingX="1rem"
                        >
                            <Box>
                                <Text sx={{ fontWeight: 'bold' }}>
                                    Select List
                                </Text>
                                <Button
                                    onClick={() => router.push('/lists/create')}
                                    colorScheme="blue"
                                    width="100%"
                                    variant="outline"
                                    {...createListsButtonProps}
                                >
                                    Create New List
                                </Button>
                            </Box>

                            <Divider orientation="horizontal" />

                            {/* TODO: Highlight list name when selected */}
                            <List>
                                {lists?.map((list) => (
                                    <ListItem
                                        key={list.id}
                                        onClick={() => handleSelectList(list)}
                                        cursor="pointer"
                                    >
                                        {list.name}
                                    </ListItem>
                                ))}
                            </List>
                        </Stack>
                        <Stack direction="column" flex={3}>
                            {children}
                        </Stack>
                    </Stack>
                </Box>
            </main>
        </Box>
    )
}
