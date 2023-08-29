import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Divider,
  Input,
  InputGroup,
  InputLeftAddon,
  Stack,
  useToast,
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
  SignInResponse,
} from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { FaGithub, FaKey, FaUser } from "react-icons/fa";
import wait from "../../utils/wait";
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

  const router = useRouter();
  const toast = useToast();

  const filteredProviders = useMemo(() => {
    if (!providers) return null;

    // Exclude the credentials provider, since we're using a custom form for it.
    return Object.values(providers).filter((p) => p.id !== "credentials");
  }, [providers]);

  const [credentialsInput, setCredentialsInput] = useState({
    username: "",
    password: "",
  });

  const [credentialsInputStep, setCredentialsInputStep] = useState<
    "username" | "password"
  >("username");

  const [isLoggingIn, setLoggingIn] = useState(false);

  const handleSignIn = useCallback(
    async (
      signInMethod: () => Promise<SignInResponse | undefined>,
      providerName: string | "credentials" = "credentials"
    ) => {
      setLoggingIn(true);
      toast.closeAll();
      const statusToast = toast({
        title: "Signing in...",
        status: "loading",
      });
      try {
        await wait(0.25);
        const result = await signInMethod();
        await router.push(
          (router.query.callbackUrl as string | undefined) ?? "/"
        );
        if (result?.error) {
          throw new Error(result.error);
        }

        if (providerName === "credentials") {
          // For now, not showing success toast for OAuth providers like GitHub because the signIn callback doesn't return a result with proper data to check if the sign in was successful.
          const successDescription = `Logged in as: ${credentialsInput.username}`;
          toast.update(statusToast, {
            title: "Success 👋",
            description: successDescription,
            status: "success",
          });
        }
      } catch (e) {
        const errorTitle = `Sign in failed`;
        const errorDescription = `Username and/or password may be incorrect.`;
        toast.update(statusToast, {
          title: errorTitle,
          description: errorDescription,
          status: "error",
        });

        console.error(`${errorTitle}: ${errorDescription}`);
        console.error(e);
        setLoggingIn(false);
      }
    },
    [credentialsInput.username, router, toast]
  );

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
              <InputGroup
                fontSize="12px"
                padding="0"
                transition="none !important"
              >
                <InputLeftAddon
                  bgColor={isLoggingIn ? "blackAlpha.200" : "gray.200"}
                  border="none"
                  transition="none !important"
                >
                  {credentialsInputStep === "username" ? (
                    <FaUser />
                  ) : (
                    <FaKey color={isLoggingIn ? "#79746A" : "inherit"} />
                  )}
                </InputLeftAddon>

                <Input
                  bgColor="gray.100"
                  type={
                    credentialsInputStep === "username" ? "text" : "password"
                  }
                  placeholder={
                    credentialsInputStep === "username"
                      ? "Enter Admin Username"
                      : "Enter Password"
                  }
                  value={
                    credentialsInputStep === "username"
                      ? credentialsInput.username
                      : credentialsInput.password
                  }
                  onChange={(e) => {
                    if (credentialsInputStep === "username") {
                      setCredentialsInput({
                        ...credentialsInput,
                        username: e.target.value,
                      });
                    } else {
                      setCredentialsInput({
                        ...credentialsInput,
                        password: e.target.value,
                      });
                    }
                  }}
                  isDisabled={isLoggingIn}
                  transition="none !important"
                />
              </InputGroup>
              <ButtonGroup width="100%" mt="1rem">
                {credentialsInputStep === "password" && (
                  <Button
                    onClick={() => {
                      if (credentialsInputStep === "password") {
                        setCredentialsInput({
                          ...credentialsInput,
                          password: "",
                        });
                        setCredentialsInputStep("username");
                      }
                    }}
                    flex={1}
                    isDisabled={isLoggingIn}
                    transition="none !important"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={async () => {
                    if (credentialsInputStep === "username") {
                      setCredentialsInputStep("password");
                      return;
                    }

                    if (credentialsInputStep === "password") {
                      await handleSignIn(
                        () =>
                          new Promise(async (res, rej) => {
                            const result = await signIn("credentials", {
                              username: credentialsInput.username,
                              password: credentialsInput.password,
                              redirect: false,
                            });
                            if (!result) return rej();
                            if (result?.error) return rej(result.error);
                            res(result);
                          }),
                        "credentials"
                      );
                    }
                  }}
                  flex={1}
                  transition="none !important"
                  isDisabled={
                    (credentialsInputStep === "username"
                      ? credentialsInput.username === ""
                      : credentialsInput.password === "") || isLoggingIn
                  }
                >
                  {credentialsInputStep === "username" ? "Next" : "Sign In"}
                </Button>
              </ButtonGroup>
              {filteredProviders && filteredProviders.length > 0 && (
                <Divider my="1rem" borderColor="whiteAlpha.700" />
              )}
              {filteredProviders &&
                filteredProviders.map((provider) => (
                  <div key={provider.name} style={{ marginBottom: 0 }}>
                    <Button
                      onClick={async () => {
                        await handleSignIn(
                          () =>
                            new Promise(async (res, rej) => {
                              const result = await signIn(provider.id, {
                                redirect: false,
                              });
                              res(result);
                            }),
                          provider.name
                        );
                      }}
                      width="100%"
                      bgColor="black"
                      color="white"
                      _hover={{
                        bgColor: "black",
                        color: "white",
                      }}
                      rightIcon={getProviderIcon(provider.id) ?? undefined}
                      isDisabled={isLoggingIn}
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
