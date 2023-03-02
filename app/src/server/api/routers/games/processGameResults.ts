import { GameObject, PlayerScore, Weight } from "@prisma/client";
import { performance } from "perf_hooks";
import { z } from "zod";
import normalizeScores from "../../../shared/normalizeScores";
import { publicProcedure } from "../../trpc";
import modes, {
  availableModes,
} from "./../../../../features/play/modes/_index";

const choiceItemSchema = z.object({
  gameObjectId: z.string(),
});
const userChoiceSchema = z.object({
  picked: choiceItemSchema,
  not_picked: choiceItemSchema,
});

const modeSchema = z.enum(availableModes);

export const processGameResults = publicProcedure
  .input(
    z.object({
      playerId: z.string(),
      mode: modeSchema,
      modeParams: z.unknown(),
      results: z.array(userChoiceSchema),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const startTime = performance.now();

    const { results } = input;

    const player = await ctx.prisma.player.findUnique({
      where: {
        id: input.playerId,
      },
    });

    if (!player) {
      await ctx.prisma.player.create({
        data: {
          id: input.playerId,
        },
      });
    }

    const modeMiddleware = modes[input.mode].backendMiddleware;
    const output = await modeMiddleware(input.modeParams);
    return { output };

    // const resultGameObjectIds = new Set<string>();
    // results.forEach((choice) => {
    //   resultGameObjectIds.add(choice.picked.gameObjectId);
    //   resultGameObjectIds.add(choice.not_picked.gameObjectId);
    // });

    // const resultGameObjects = await ctx.prisma.gameObject.findMany({
    //   where: {
    //     id: {
    //       in: Array.from(resultGameObjectIds),
    //     },
    //   },
    //   include: {
    //     FromGameObjectRelationship: {
    //       include: {
    //         weight: true,
    //         toGameObject: true,
    //       },
    //     },
    //   },
    // });

    // const relatedGameObjectIds = new Set<string>();
    // const relatedGameObjectsMap = new Map<
    //   GameObject["id"],
    //   Map<GameObject["id"], Weight>
    // >();
    // resultGameObjects.forEach((gameObject) => {
    //   gameObject.FromGameObjectRelationship.forEach((relationship) => {
    //     relatedGameObjectIds.add(relationship.toGameObjectId);

    //     if (!relatedGameObjectsMap.has(gameObject.id)) {
    //       relatedGameObjectsMap.set(
    //         gameObject.id,
    //         new Map<GameObject["id"], Weight>()
    //       );
    //     }

    //     relatedGameObjectsMap
    //       .get(gameObject.id)
    //       ?.set(relationship.toGameObjectId, relationship.weight);
    //   });
    // });

    // const resultAndRelatedGameObjectIds = [
    //   ...resultGameObjectIds,
    //   ...relatedGameObjectIds,
    // ];
    // const existingPlayerScores = await ctx.prisma.playerScore.findMany({
    //   where: {
    //     gameObjectId: {
    //       in: resultAndRelatedGameObjectIds,
    //     },
    //     playerId: input.playerId,
    //   },
    // });
    // const existingPlayerScoresMap = new Map<GameObject["id"], PlayerScore>();
    // existingPlayerScores.forEach((playerScore) => {
    //   existingPlayerScoresMap.set(playerScore.gameObjectId, playerScore);
    // });

    // const scoresMap = new Map<GameObject["id"], number>();
    // resultAndRelatedGameObjectIds.forEach((gameObjectId) => {
    //   const existingPlayerScore =
    //     existingPlayerScoresMap.get(gameObjectId)?.score.toNumber() ?? 0;
    //   scoresMap.set(gameObjectId, existingPlayerScore);
    // });

    // const winnerScoreBonus = 1;
    // results.forEach((choice) => {
    //   const { picked, not_picked } = choice;

    //   const pickedScore = scoresMap.get(picked.gameObjectId)!;
    //   const notPickedScore = scoresMap.get(not_picked.gameObjectId)!;

    //   const updatedWinnerScore =
    //     pickedScore + winnerScoreBonus + notPickedScore;
    //   scoresMap.set(picked.gameObjectId, updatedWinnerScore);

    //   if (!relatedGameObjectsMap.has(picked.gameObjectId)) return;
    //   const relatedGameObjects = relatedGameObjectsMap.get(
    //     picked.gameObjectId
    //   )!;
    //   relatedGameObjects.forEach((weight, relatedId) => {
    //     const updatedScore =
    //       scoresMap.get(relatedId)! +
    //       weight.weight.toNumber() * (winnerScoreBonus + notPickedScore);
    //     scoresMap.set(relatedId, updatedScore);
    //   });
    // });

    // await ctx.prisma.$transaction([
    //   ...Array.from(scoresMap.entries()).map(([gameObjectId, score]) => {
    //     const existingPlayerScore = existingPlayerScoresMap.get(gameObjectId);
    //     if (existingPlayerScore) {
    //       return ctx.prisma.playerScore.update({
    //         where: {
    //           playerId_gameObjectId: {
    //             playerId: input.playerId,
    //             gameObjectId,
    //           },
    //         },
    //         data: {
    //           score,
    //         },
    //       });
    //     } else {
    //       return ctx.prisma.playerScore.create({
    //         data: {
    //           player: {
    //             connect: {
    //               id: input.playerId,
    //             },
    //           },
    //           gameObject: {
    //             connect: {
    //               id: gameObjectId,
    //             },
    //           },
    //           score,
    //         },
    //       });
    //     }
    //   }),
    // ]);

    // const { allPlayerScoresNormalized } = await normalizeScores(input.playerId);
    // const resultScores = allPlayerScoresNormalized.filter((playerScore) => {
    //   return scoresMap.has(playerScore.gameObjectId);
    // });

    // const endTime = performance.now();
    // const elapsedTimeMS = endTime - startTime;

    // return { resultScores, elapsedTimeMS };
  });
