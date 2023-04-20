import { PrismaClient, Secret } from "@prisma/client";
import jwt from "jsonwebtoken";
import { createInnerTRPCContext } from "../../../../src/server/api/trpc";
import { prisma } from "../../../../src/server/db";
import { playerTokenSchema } from "../../../../src/server/helpers/checkUserAuth";
import { setPlayerToken } from "../../../../src/utils/api";

export const createInnerTRPCContextWithSessionForTest = () => {
  return createInnerTRPCContext({
    session: {
      user: { id: "123", name: "Test" },
      expires: "1",
    },
  });
};

export const createInnerTRPCContextWithPlayerTokenAuthForTest = (
  playerTokenData: typeof playerTokenSchema._type,
  secret: Secret["secret"]
) => {
  const playerToken = jwt.sign(playerTokenData, secret);
  setPlayerToken(playerToken);

  return createInnerTRPCContext({
    session: null,
    authData: playerTokenData,
    headers: {
      authorization: `Bearer ${playerToken}`,
    },
  });
};

export async function clearDbsTest(prisma: PrismaClient) {
  const toClear = [
    prisma.account.deleteMany(),
    prisma.example.deleteMany(),
    prisma.game.deleteMany(),
    prisma.gameObject.deleteMany(),
    prisma.gameObjectRelationship.deleteMany(),
    prisma.player.deleteMany(),
    prisma.playerScore.deleteMany(),
    prisma.session.deleteMany(),
    prisma.secret.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.user.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.weight.deleteMany(),
  ];

  await Promise.all(toClear);
}

export async function createTestSecret() {
  return await prisma.secret.create({
    data: { id: "test-app-id", secret: "test-secret" },
  });
}
