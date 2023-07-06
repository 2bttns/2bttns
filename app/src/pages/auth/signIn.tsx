import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Input,
  Stack,
} from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import { BuiltInProviderType } from "next-auth/providers";
import {
  ClientSafeProvider,
  getCsrfToken,
  getProviders,
  getSession,
  LiteralUnion,
  signIn,
} from "next-auth/react";
import Image from "next/image";
import { FaGithub } from "react-icons/fa";
import { NextPageWithLayout } from "../_app";

export type SignInPageProps = {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
  csrfToken: string | undefined;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    const urlSearchParamsString = context.req.url?.split("?")[1];
    const urlSearchParams = new URLSearchParams(urlSearchParamsString);
    const callbackUrl = urlSearchParams.get("callbackUrl") ?? "/";
    return { redirect: { destination: callbackUrl }, props: {} };
  }

  const providers = await getProviders();
  const csrfToken = await getCsrfToken(context);
  const props: SignInPageProps = { providers, csrfToken };

  return {
    props,
  };
};

const SignInPage: NextPageWithLayout<SignInPageProps> = (props) => {
  const { providers, csrfToken } = props;
  return (
    <Box width="100vw" height="100vh" overflow="hidden" bgColor="blue.900">
      <Stack
        direction={{ base: "column", md: "row" }}
        alignItems="stretch"
        justifyContent="stretch"
        height={{ base: "auto", md: "100%" }}
      >
        <Box bgColor="yellow.500" flex={1} display="grid" placeItems="center">
          <Card
            minW="sm"
            maxW="md"
            mt={{ base: "2rem", md: "0rem" }}
            bgColor="blackAlpha.800"
            backdropFilter="blur(20px)"
          >
            <CardBody>
              <Image
                src="/2btnns-webgif-compressed.gif"
                width="128"
                height="128"
                alt="App Logo"
                style={{ margin: "0 auto", userSelect: "none" }}
              />
              <Input name="csrfToken" type="hidden" defaultValue={csrfToken} />
              <Input
                placeholder="Email (Not Setup - Please Use Github)"
                fontSize="12px"
                padding="8px"
                bgColor="gray.100"
                border="1px solid black"
                isDisabled
              />
              <Button width="100%" mt="1rem" isDisabled>
                Sign In
              </Button>
              <Divider my="1rem" borderColor="whiteAlpha.700" />
              {providers &&
                Object.values(providers).map((provider) => (
                  <div key={provider.name} style={{ marginBottom: 0 }}>
                    <Button
                      onClick={() => signIn(provider.id)}
                      width="100%"
                      bgColor="black"
                      color="white"
                      _hover={{
                        bgColor: "black",
                        color: "white",
                      }}
                      rightIcon={getProviderIcon(provider.id) ?? undefined}
                    >
                      Sign in with {provider.name}
                    </Button>
                  </div>
                ))}
            </CardBody>
          </Card>
        </Box>
        <Box bgColor="blue.900" flex={{ base: 0, md: 1 }} />
      </Stack>
    </Box>
  );
};

SignInPage.getLayout = (page) => page;

export default SignInPage;

function getProviderIcon(providerId: "github" | string) {
  switch (providerId) {
    case "github":
      return <FaGithub />;
    default:
      return null;
  }
}
