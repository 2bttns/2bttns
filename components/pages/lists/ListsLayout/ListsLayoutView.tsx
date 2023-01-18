import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    ButtonProps,
    Divider,
    Heading,
    Link as ChakraLink,
    List,
    ListItem,
    Stack,
    Text,
} from '@chakra-ui/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ListAttributes } from '../../../../db/models/ListModel'
import { DEFAULT_LIST_NAME } from '../../../../lib/constants'

export type ListsLayoutViewProps = {
    children: React.ReactNode
    lists: ListAttributes[] | undefined
    currentListId: string | undefined
    handleSelectList: (list: ListAttributes) => void
    listsLoading?: boolean
    listsError?: Error | undefined
    subtitle?: string
    breadcrumbs?: BreadcrumbItem[]
    createListsButtonProps?: ButtonProps
}

export type BreadcrumbItem = {
    label: string
    href: string
}

// TODO: Make this more generic and move to a shared location; re-use for "games" page
export default function ListsLayoutView(props: ListsLayoutViewProps) {
    const {
        children,
        subtitle,
        lists,
        currentListId,
        handleSelectList,
        listsLoading,
        listsError,
        breadcrumbs,
        createListsButtonProps,
    } = props

    const router = useRouter()

    return (
        <Box sx={{ padding: '1rem', backgroundColor: '#ddd', height: '100vh' }}>
            <Head>
                <title>{subtitle ? `${subtitle} | ` : ''}My Lists</title>
                <meta name="description" content="My 2bttns Lists" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Divider orientation="horizontal" sx={{ paddingY: '1rem' }} />

                <Box
                    sx={{
                        backgroundColor: '#fff',
                        padding: '1rem',
                        minHeight: '90vh',
                    }}
                >
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
                                    sx={{
                                        marginY: '0.5rem',
                                    }}
                                    {...createListsButtonProps}
                                >
                                    Create New List
                                </Button>
                            </Box>

                            <Divider orientation="horizontal" />
                            {listsLoading && <Text>Loading...</Text>}
                            {listsError && (
                                <>
                                    <Text>
                                        Failed to load lists.{' '}
                                        <ChakraLink
                                            href="/"
                                            sx={{ color: 'blue.600' }}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                router.reload()
                                            }}
                                        >
                                            Click here to reload the page.
                                        </ChakraLink>
                                    </Text>
                                </>
                            )}
                            <List>
                                {lists?.map((list) => (
                                    <ListItem
                                        key={list.id}
                                        onClick={() => handleSelectList(list)}
                                        cursor="pointer"
                                        sx={{
                                            padding: '0.5rem',
                                            borderBottom: '1px solid #ddd',
                                            backgroundColor:
                                                currentListId === list.id
                                                    ? '#ddd'
                                                    : '#fff',
                                            ':hover': {
                                                backgroundColor: '#ddd',
                                            },
                                        }}
                                        tabIndex={0}
                                    >
                                        {list.name || DEFAULT_LIST_NAME}
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