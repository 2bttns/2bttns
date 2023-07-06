import { prisma } from "../db";

export default async function normalizeScores(playerId: string) {
  const playerScores = await prisma.playerScore.findMany({
    where: {
      playerId,
    },
  });

  const maxScore = Math.max(
    ...playerScores.map((playerScore) => playerScore.score.toNumber())
  );

  const allPlayerScoresNormalized = await prisma.$transaction(
    playerScores.map((playerScore) => {
      const normalizedScore = playerScore.score.toNumber() / maxScore;
      return prisma.playerScore.update({
        where: {
          playerId_gameObjectId: {
            playerId,
            gameObjectId: playerScore.gameObjectId,
          },
        },
        data: {
          score: normalizedScore,
        },
      });
    })
  );

  return { allPlayerScoresNormalized };
}
