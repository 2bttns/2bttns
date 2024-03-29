import {
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Game, Player } from "@prisma/client";
import jwt from "jsonwebtoken";
import type { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useMemo } from "react";
import { z } from "zod";
import AdminLayout from "../features/layouts/containers/AdminLayout";
import PlayerLayout from "../features/layouts/containers/PlayerLayout";
import PlayMode from "../features/play/containers/PlayMode";
import { AvailableModes } from "../modes/availableModes";
import { getModeUI } from "../modes/modesUIRegistry";
import { ModeUIProps } from "../modes/types";
import { prisma } from "../server/db";
import { api, setPlayerToken } from "../utils/api";
import { logger } from "../utils/logger";
import { NextPageWithLayout } from "./_app";

const jwtSchema = z.object({
  playerId: z.string(),
  iat: z.preprocess((value) => new Date((value as number) * 1000), z.date()),
  exp: z.preprocess((value) => new Date((value as number) * 1000), z.date()),
});

type ReturnType = {
  gameId: string;
  playerToken: string | null; // If the user is a player, this is the JWT they will use to authenticate with the API
  gameModeData: {
    mode: AvailableModes;
    config: ModeUIProps<any>["config"];
  };
  gameData: ModeUIProps<any>["gameData"];
  overrideToPlayerViewAsAdmin: boolean | null;
};

export const PLAY_URL_SEARCH_PARAMS = {
  GAME_ID: "game_id",
  APP_ID: "app_id",
  JWT: "jwt",
  NUM_ITEMS: "num_items",
  CALLBACK_URL: "callback_url",
  ADMIN_VIEW: "admin_view",
};

export const ADMIN_VIEW = {
  PLAYER: "player",
};

export const getServerSideProps: GetServerSideProps<ReturnType> = async (
  context
) => {
  try {
    const urlSearchParamsString = context.req.url?.split("?")[1];
    const urlSearchParams = new URLSearchParams(urlSearchParamsString);
    const gameId = urlSearchParams.get(PLAY_URL_SEARCH_PARAMS.GAME_ID);
    const appId = urlSearchParams.get(PLAY_URL_SEARCH_PARAMS.APP_ID);
    const incomingJwt = urlSearchParams.get(PLAY_URL_SEARCH_PARAMS.JWT);
    const numItems = urlSearchParams.get(PLAY_URL_SEARCH_PARAMS.NUM_ITEMS);
    let callbackUrl = urlSearchParams.get(PLAY_URL_SEARCH_PARAMS.CALLBACK_URL);
    let overrideToPlayerViewAsAdmin: ReturnType["overrideToPlayerViewAsAdmin"] =
      null;

    if (!gameId) {
      throw new Error("No game id provided");
    }

    const session = await getSession(context);

    let playerId: string | null = null;
    if (session) {
      // The user is an admin signed into this 2bttns admin app
      // Note that users playing the game would never be signed into the admin app
      playerId = session.user.id;

      // If the user is an admin, they can optionally use the player view of the game by setting the admin_view query param to "player"
      // Otherwise, they will see the game embedded in the admin console layout
      overrideToPlayerViewAsAdmin =
        urlSearchParams.get(PLAY_URL_SEARCH_PARAMS.ADMIN_VIEW) ===
        ADMIN_VIEW.PLAYER;

      // If it's not defined, set the callbackUrl to the game's management page on the admin console
      // This is for cases where the admin is testing the game from the admin console. This will redirect them back to the game's management page.
      if (!callbackUrl) callbackUrl = `/games/${gameId}`;
    }

    if (incomingJwt) {
      // The user was redirected here from an external app via JWT
      // Get the playerId from that JWT

      // This can override the admin user id if the JWT is valid, indicating that the logged in admin was redirected here with a player token
      //  (this use useful if you're locally developing an app that uses 2bttns, and you want to test the player experience without going into incognito mode in your browser)

      // Ensure the app id was provided, so it can be used to verify the JWT against its corresponding secret
      if (!appId) {
        throw new Error("No app id provided");
      }

      // Ensure the incoming JWT is valid
      const appSecret = await prisma.secret.findFirst({
        where: { id: appId },
      });

      if (!appSecret) {
        throw new Error("Invalid app id");
      }

      jwt.verify(incomingJwt, appSecret.secret, {});
      const decodedJwtRaw = jwt.decode(incomingJwt, {});
      const decoded = jwtSchema.parse(decodedJwtRaw);
      playerId = decoded.playerId;
    }

    if (!playerId) {
      throw new Error("No playerId found");
    }

    // Ensure the game exists while getting the necessary data
    const game = await prisma.game.findUniqueOrThrow({
      where: { id: gameId },
      include: { inputTags: true },
    });

    // Query param that can be used to override the default number of items per round
    // If no default is set, get all items
    let numItemsQueryParam: number | null | "ALL" = null;
    if (numItems) {
      if (numItems === "ALL") {
        numItemsQueryParam = "ALL";
      } else {
        const parsedNumItems = parseInt(numItems);
        if (isNaN(parsedNumItems)) {
          throw new Error("Invalid num_items query param");
        }
        numItemsQueryParam = parsedNumItems;
      }
    }
    let numItemsToGet =
      numItemsQueryParam ?? game.defaultNumItemsPerRound ?? "ALL";
    if (numItemsToGet === "ALL") {
      numItemsToGet = await prisma.gameObject.count({
        where: {
          tags: { some: { id: { in: game.inputTags.map((t) => t.id) } } },
        },
      });
    }

    return {
      props: {
        gameId: gameId ?? "",
        playerToken: incomingJwt,
        gameModeData: {
          mode: game.mode as AvailableModes,
          config: game.modeConfigJson ? JSON.parse(game.modeConfigJson) : {},
        },
        gameData: {
          playerId: playerId,
          game: JSON.parse(JSON.stringify(game)),
          numRoundItems: numItemsToGet,
          callbackUrl,
          isAdmin: !!session?.user,
        },
        overrideToPlayerViewAsAdmin,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`/play - ${error.stack}`);
    }
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }
};

const Play: NextPageWithLayout<ReturnType> = (props) => {
  const {
    gameId,
    playerToken,
    gameModeData,
    gameData,
    overrideToPlayerViewAsAdmin,
  } = props;

  const showAdminLayout = useMemo(() => {
    // If the user is a player, they should not see the admin layout
    // Even if the admiin is logged in, they should not see the admin layout if they were redirected here with a player token
    if (playerToken) return false;

    // If the admin is overriding to the player view, they should not see the admin layout
    if (overrideToPlayerViewAsAdmin) return false;

    return gameData.isAdmin;
  }, [playerToken, gameData.isAdmin, overrideToPlayerViewAsAdmin]);

  useEffect(() => {
    // This hook should only run on the client; not on the server
    if (typeof window === "undefined") return;

    // Set the player token so the API can use it to authenticate requests
    // If null is passed, the token will be cleared, meaning the TRPC client will not send any auth headers & defer to other default auth methods (e.g. admin session or API key token)
    setPlayerToken(playerToken);
  }, []);

  const modeFrontendComponent = useMemo(() => {
    if (!gameModeData.mode) return null;
    return getModeUI(gameModeData.mode)?.FrontendComponent;
  }, [gameModeData.mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (gameData.game.customCss === null) return;

    const styleElement = document.createElement("style");

    const customCssWithoutEscapedLineBreaks =
      gameData.game.customCss.replaceAll("\\n", "\n");
    styleElement.innerHTML = customCssWithoutEscapedLineBreaks;
    document.head.appendChild(styleElement);
    console.log(
      `%c
-----------------------------------------------------------------

%c[2bttns] [gameId=${gameId}] %ccustomCss found! Applied to page.

%c${gameData.game.customCss as string}

-----------------------------------------------------------------
      `,
      "color: gray",
      "color: yellow",
      "color: white",
      "color: gray"
    );

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <Layout showAdminLayout={showAdminLayout} playerId={gameData.playerId}>
      <Head>
        <title>Play 2bttns</title>
        <meta
          name="description"
          content="You are now playing the 2bttns game."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ScoresModal gameId={gameId} playerId={gameData.playerId} />
      {modeFrontendComponent && (
        <PlayMode
          ModeFrontendComponent={modeFrontendComponent}
          modeFrontendProps={{
            gameData,
            config: gameModeData.config,
          }}
        />
      )}
      {!modeFrontendComponent && (
        <Text textAlign={"center"}>
          Game mode not found. If you are the administator, please update your
          game&apos;s configuration.
        </Text>
      )}
    </Layout>
  );
};

export default Play;

type LayoutProps = {
  children: React.ReactNode;
  playerId: string;
  showAdminLayout: boolean;
};
function Layout(props: LayoutProps) {
  const { children, showAdminLayout, playerId } = props;

  if (showAdminLayout) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return (
    <PlayerLayout>
      <Text textAlign="right" padding="1rem" className="play__player-id-text">
        Player ID: {playerId}
      </Text>
      {children}
    </PlayerLayout>
  );
}

Play.getLayout = (page) => {
  return page;
};

type ScoresModalProps = {
  gameId: Game["id"];
  playerId: Player["id"];
};

function ScoresModal({ gameId, playerId }: ScoresModalProps) {
  const scoresQuery = api.games.getPlayerScores.useQuery(
    {
      game_id: gameId,
      player_id: playerId,
      include_game_objects: true,
    },
    {
      cacheTime: 0,
    }
  );

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpen = () => {
    scoresQuery.refetch();
    onOpen();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxHeight={"500px"} overflowY="auto">
          <ModalHeader>My Scores - {gameId}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              {scoresQuery.data?.playerScores.map((score) => {
                return (
                  <Badge key={score.gameObjectId}>
                    <>
                      {score.gameObject?.name ?? score.gameObjectId} ={" "}
                      {score.score}
                    </>
                  </Badge>
                );
              })}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
