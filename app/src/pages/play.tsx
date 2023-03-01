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
import { z } from "zod";
import AdminLayout from "../features/layouts/containers/AdminLayout";
import UserLayout from "../features/layouts/containers/UserLayout";
import PlayContainer, {
  PlayContainerProps,
} from "../features/play/containers/PlayContainer";
import { prisma } from "../server/db";
import getRandomGameObjects from "../server/helpers/getRandomGameObjects";
import { api } from "../utils/api";
import { NextPageWithLayout } from "./_app";

const jwtSchema = z.object({
  userId: z.string(),
  iat: z.preprocess((value) => new Date((value as number) * 1000), z.date()),
  exp: z.preprocess((value) => new Date((value as number) * 1000), z.date()),
});

type ReturnType = {
  gameId: string;
  userId: string;
  isAdmin: boolean;
  gameData: PlayContainerProps["gameData"];
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

  try {
    if (!gameId) {
      throw new Error("No game id provided");
    }

    const session = await getSession(context);

    let userId: string;
    if (session) {
      // The user is an admin signed into this 2bttns admin app
      // Note that users playing the game would never be signed into the admin app
      userId = session.user.id;
    } else {
      // The user was redirected here from an external app via JWT
      // Get the userId from that JWT
      if (!incomingJwt) {
        throw new Error("No jwt provided");
      }

      // Ensure the app id was provided, so it can be used to get verify the JWT against the corresponding secret
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

    // Ensure the game exists while getting the necessary data
    const game = await prisma.game.findUniqueOrThrow({
      where: { id: gameId },
    });

    // Get the game objects for the round
    const numItemsQueryParam = numItems ? parseInt(numItems) : null;
    const numItemsToGet = numItemsQueryParam ?? game.defaultNumItemsPerRound;
    const shuffledGameObjects = await getRandomGameObjects(
      gameId,
      numItemsToGet ?? "ALL"
    );

    return {
      props: {
        gameId: gameId ?? "",
        userId,
        isAdmin: !!session?.user,
        gameData: {
          game: JSON.parse(JSON.stringify(game)),
          gameObjects: JSON.parse(JSON.stringify(shuffledGameObjects)),
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
  const { gameId, userId, isAdmin, gameData } = props;
  return (
    <Layout isAdmin={isAdmin} userId={userId}>
      <Head>
        <title>Play 2bttns</title>
        <meta
          name="description"
          content="You are now playing the 2bttns game."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ScoresModal gameId={gameId} playerId={userId} />
      <PlayContainer playerId={userId} gameData={gameData} />
    </Layout>
  );
};

export default Play;

type LayoutProps = {
  children: React.ReactNode;
  userId: string;
  isAdmin: boolean;
};
function Layout(props: LayoutProps) {
  const { children, isAdmin, userId } = props;

  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return (
    <UserLayout
      navbarProps={{
        additionalContent: <h1>Playing 2bttns | User: {userId}</h1>,
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
                  <Badge>
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
