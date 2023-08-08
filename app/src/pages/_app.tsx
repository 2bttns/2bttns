import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";

import { api } from "../utils/api";

import { ChakraProvider } from "@chakra-ui/react";

import type { NextPage } from "next";
import { ReactElement, ReactNode } from "react";
import AdminLayout from "../features/layouts/containers/AdminLayout";
import { PageLoadingIndicator } from "../features/shared/PageLoadingIndicator";
import TwobttnsTutorialsContainer from "../features/tutorials/TwobttnsTutorialsContainer";
import theme from "../style/theme";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout<P> = AppProps<P> & {
  Component: NextPageWithLayout;
};

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout<{ session: Session | null }>) => {
  const getLayout =
    Component.getLayout ?? ((page) => <AdminLayout>{page}</AdminLayout>);

  return (
    <SessionProvider session={session}>
      <ChakraProvider
        theme={theme}
        toastOptions={{
          defaultOptions: {
            duration: 5000,
            isClosable: true,
            position: "bottom-right",
          },
        }}
      >
        <>
          {getLayout(<Component {...pageProps} />)}
          <PageLoadingIndicator />
          <TwobttnsTutorialsContainer />
        </>
      </ChakraProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
