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
  List as ChakraList,
  ListItem as ChakraListItem,
  Stack,
  Text,
} from "@chakra-ui/react";
import { List } from "@prisma/client";
import NextLink from "next/link";
import { useRouter } from "next/router";

export type ListsLayoutProps = {
  children: React.ReactNode;
  lists: List[];
  listsLoading: boolean;
  listsError?: unknown;
  handleSelectList: (list: List) => void;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  createListsButtonProps?: ButtonProps;
};

export type BreadcrumbItem = {
  label: string;
  href: string;
};

export default function ListsLayout(props: ListsLayoutProps) {
  const {
    children,
    lists,
    listsLoading,
    listsError,
    handleSelectList,
    subtitle,
    breadcrumbs,
    createListsButtonProps,
  } = props;
  const router = useRouter();

  const currentListId = router.query.listId as string | undefined;

  return (
    <Box sx={{ padding: "1rem", backgroundColor: "#ddd", height: "100vh" }}>
      <main>
        <Divider orientation="horizontal" sx={{ paddingY: "1rem" }} />

        <Box
          sx={{
            backgroundColor: "#fff",
            padding: "1rem",
            minHeight: "90vh",
          }}
        >
          <Heading as="h1" size="md">
            <Breadcrumb>
              <BreadcrumbItem>
                <NextLink href="/lists">
                  <BreadcrumbLink isCurrentPage={router.asPath === "/lists"}>
                    My Lists
                  </BreadcrumbLink>
                </NextLink>
              </BreadcrumbItem>
              {breadcrumbs?.map((breadcrumb) => {
                return (
                  <BreadcrumbItem
                    key={breadcrumb.href}
                    isCurrentPage={router.asPath === breadcrumb.href}
                  >
                    <ChakraLink href={breadcrumb.href}>
                      <BreadcrumbLink>{breadcrumb.label}</BreadcrumbLink>
                    </ChakraLink>
                  </BreadcrumbItem>
                );
              })}
            </Breadcrumb>
          </Heading>

          <Divider orientation="horizontal" sx={{ marginY: "1rem" }} />

          <Stack direction="row">
            <Stack direction="column" flex={1} maxWidth="250px" paddingX="1rem">
              <>
                <Box>
                  <Text sx={{ fontWeight: "bold" }}>Select List</Text>
                  <Button
                    onClick={() => router.push("/lists/create")}
                    colorScheme="blue"
                    width="100%"
                    variant="outline"
                    sx={{
                      marginY: "0.5rem",
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
                      Failed to load lists.{" "}
                      <ChakraLink
                        href="/"
                        sx={{ color: "blue.600" }}
                        onClick={(e) => {
                          e.preventDefault();
                          router.reload();
                        }}
                      >
                        Click here to reload the page.
                      </ChakraLink>
                    </Text>
                  </>
                )}
                <ChakraList>
                  {lists?.map((list) => (
                    <ChakraListItem
                      key={list.id}
                      onClick={() => handleSelectList(list)}
                      cursor="pointer"
                      sx={{
                        padding: "0.5rem",
                        borderBottom: "1px solid #ddd",
                        backgroundColor:
                          currentListId === list.id ? "#ddd" : "#fff",
                        ":hover": {
                          backgroundColor: "#ddd",
                        },
                      }}
                      tabIndex={0}
                    >
                      {list.name || "Untitled List"}
                    </ChakraListItem>
                  ))}
                </ChakraList>
              </>
            </Stack>
            <Stack direction="column" flex={3}>
              {children}
            </Stack>
          </Stack>
        </Box>
      </main>
    </Box>
  );
}
