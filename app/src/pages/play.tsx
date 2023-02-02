import { Text } from "@chakra-ui/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "../utils/api";

const Play: NextPage = () => {
  const router = useRouter();
  const gameId = router.query.game_id as string | undefined;

  const redirectInvalidGame = () => {
    router.push("/404");
  };

  const gamesQuery = api.games.getById.useQuery(
    { id: gameId! },
    {
      retry: false,
      enabled: gameId !== undefined,
      onError: (error) => {
        console.error(error);
        redirectInvalidGame();
      },
    }
  );

  if (gamesQuery.isLoading) {
    return <Text>Loading game...</Text>;
  }

  if (gamesQuery.error) {
    return null;
  }

  const items: { id: string }[] = "abcde".split("").map((n) => {
    return { id: n };
  });

  return <div>{JSON.stringify(gamesQuery.data)}</div>;

  //   return (
  //     <div>
  //       <Head>
  //         <title> {game?.name && `${game.name} | `}Play 2bttns</title>
  //         <meta
  //           name="description"
  //           content="You are now playing the 2bttns game."
  //         />
  //         <link rel="icon" href="/favicon.ico" />
  //       </Head>

  //       {/* TODO: swap out game modes if a frontend plugin is active for the game (e.g. Tinder-style) */}
  //       <Heading
  //         as="h1"
  //         sx={{
  //           fontSize: "48px",
  //           marginTop: "2rem",
  //           textAlign: "center",
  //         }}
  //       >
  //         {game?.name}
  //       </Heading>
  //       <ClassicMode
  //         items={items}
  //         hotkeys={{
  //           first: ["w", "ArrowUp"],
  //           second: ["s", "ArrowDown"],
  //         }}
  //       >
  //         {({ button1, button2, isFinished, context }) => {
  //           return (
  //             <Stack direction="column" alignItems="center">
  //               <Text
  //                 as="h1"
  //                 sx={{
  //                   fontSize: "32px",
  //                   marginBottom: "2rem",
  //                   marginTop: "2rem",
  //                 }}
  //               >
  //                 {isFinished ? "Round over!" : "Which is more fun?"}
  //               </Text>

  //               {!isFinished && (
  //                 <>
  //                   {button1}
  //                   <Text
  //                     sx={{
  //                       textTransform: "uppercase",
  //                       padding: "1rem",
  //                     }}
  //                   >
  //                     or
  //                   </Text>
  //                   {button2}
  //                 </>
  //               )}

  //               {isFinished && (
  //                 <Code
  //                   sx={{
  //                     textTransform: "uppercase",
  //                     padding: "1rem",
  //                     width: "540px",
  //                   }}
  //                 >
  //                   {JSON.stringify(context.results, null, 2)}
  //                 </Code>
  //               )}
  //             </Stack>
  //           );
  //         }}
  //       </ClassicMode>
  //     </div>
  //   );
};

export default Play;
