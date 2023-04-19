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
import UserLayout from "../features/layouts/containers/UserLayout";
import PlayMode from "../features/play/containers/PlayMode";
import { AvailableModes } from "../modes/availableModes";
import { getModeUI } from "../modes/modesUIRegistry";
import { ModeUIProps } from "../modes/types";
import { prisma } from "../server/db";
import { api, setPlayerToken } from "../utils/api";
import { NextPageWithLayout } from "./_app";

const jwtSchema = z.object({
  userId: z.string(),
  iat: z.preprocess((value) => new Date((value as number) * 1000), z.date()),
  exp: z.preprocess((value) => new Date((value as number) * 1000), z.date()),
});

type ReturnType = {
  gameId: string;
  isAdmin: boolean; // Admins are the users who are actually signed into the admin app
  playerToken: string | null; // If the user is a player, this is the JWT they will use to authenticate with the API
  gameModeData: {
    mode: AvailableModes;
    config: ModeUIProps<any>["config"];
  };
  gameData: ModeUIProps<any>["gameData"];
};

export const getServerSideProps: GetServerSideProps<ReturnType> = async (
  context
) => {
  const url = `${context.req.headers.host}${context.req.url}`;
  const urlObj = new URL(url);
  const gameId = urlObj.searchParams.get("game_id");
  const appId = urlObj.searchParams.get("app_id");
  const incomingJwt = urlObj.searchParams.get("jwt");
  const numItems = urlObj.searchParams.get("num_items");
  const callbackUrl = urlObj.searchParams.get("callback_url");

  try {
    if (!gameId) {
      throw new Error("No game id provided");
    }

    const session = await getSession(context);

    let userId: string | null = null;
    if (session) {
      // The user is an admin signed into this 2bttns admin app
      // Note that users playing the game would never be signed into the admin app
      userId = session.user.id;
    }

    if (incomingJwt) {
      // The user was redirected here from an external app via JWT
      // Get the userId from that JWT

      // This can override the admin user id if the JWT is valid, indicating that the logged in admin was redirected here with a player token
      //  (this allows admins to test the game as if they are a player)

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
      userId = decoded.userId;
    }

    if (!userId) {
      throw new Error("No user id found");
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
        isAdmin: !!session?.user,
        playerToken: incomingJwt,
        gameModeData: {
          mode: game.mode as AvailableModes,
          config: game.modeConfigJson ? JSON.parse(game.modeConfigJson) : {},
        },
        gameData: {
          playerId: userId,
          game: JSON.parse(JSON.stringify(game)),
          // TODO: Just return #round items; individual modes will handle gameobject fetching
          numRoundItems: numItemsToGet,
          callbackUrl,
        },
      },
    };
  } catch (error) {
    console.error(error);

    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }
};

const Play: NextPageWithLayout<ReturnType> = (props) => {
  const { gameId, isAdmin, playerToken, gameModeData, gameData } = props;

  const showAdminLayout = useMemo(() => {
    // If the user is a player, they should not see the admin layout
    // Even if the admiin is logged in, they should not see the admin layout if they were redirected here with a player token
    if (playerToken) {
      return false;
    }
    return isAdmin;
  }, [playerToken, isAdmin]);

  useEffect(() => {
    // This hook should only run on the client; not on the server
    if (typeof window === "undefined") return;

    // Set the player token so the API can use it to authenticate requests
    // If null is passed, the token will be cleared, meaning the TRPC client will not send any auth headers & defer to other default auth methods (e.g. admin session or API key token)
    setPlayerToken(playerToken);
  }, []);

  return (
    <Layout showAdminLayout={showAdminLayout} userId={gameData.playerId}>
      <Head>
        <title>Play 2bttns</title>
        <meta
          name="description"
          content="You are now playing the 2bttns game."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ScoresModal gameId={gameId} playerId={gameData.playerId} />
      <PlayMode
        ModeFrontendComponent={getModeUI(gameModeData.mode).FrontendComponent}
        modeFrontendProps={{
          gameData,
          config: gameModeData.config,
        }}
      />
    </Layout>
  );
};

export default Play;

type LayoutProps = {
  children: React.ReactNode;
  userId: string;
  showAdminLayout: boolean;
};
function Layout(props: LayoutProps) {
  const { children, showAdminLayout, userId } = props;

  if (showAdminLayout) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return (
    <UserLayout
      navbarProps={{
        additionalContent: <h1>Playing 2bttns | User ID: {userId}</h1>,
      }}
    >
      {children}
    </UserLayout>
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
      <Button onClick={handleOpen}>My Scores [Debug]</Button>

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
