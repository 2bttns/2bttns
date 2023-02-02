import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { AppProps } from 'next/app'
import '../styles/globals.css'

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider>
                <Component {...pageProps} />
            </ChakraProvider>
        </QueryClientProvider>
    )
}

export default MyApp
