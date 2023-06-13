import { PrismaClient, Secret, Tag } from "@prisma/client";
import jwt from "jsonwebtoken";
import { defaultMode } from "../../../../src/modes/availableModes";
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
  await prisma.$transaction([
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
  ]);
}

export async function createTestSecret() {
  return await prisma.secret.create({
    data: { id: "test-app-id", secret: "test-secret" },
  });
}

export async function createTestGames(count: number) {
  return await prisma.game.createMany({
    data: Array.from({ length: count }, (_, i) => ({
      id: `test-game-id-${i}`,
      name: `test-game-${i}`,
      mode: defaultMode,
    })),
  });
}

export async function getAllGames() {
  return await prisma.game.findMany();
}

export async function getAllGameObjects() {
  return await prisma.gameObject.findMany();
}

export async function createTestGameObjects(options: {
  count: number;
  tags?: Tag["id"][];
  startIndex?: number;
}) {
  const { count, tags = [], startIndex = 0 } = options;
  await prisma.gameObject.createMany({
    data: Array.from({ length: count }, (_, i) => ({
      id: `test-gameobject-id-${startIndex + i}`,
      name: `test-gameobject-${startIndex + i}`,
    })),
  });

  for await (const gameObject of await getAllGameObjects()) {
    await prisma.gameObject.update({
      data: { tags: { connect: tags.map((tagId) => ({ id: tagId })) } },
      where: { id: gameObject.id },
    });
  }
}

export async function clearPlayers() {
  return await prisma.player.deleteMany();
}

export async function clearTags() {
  return await prisma.tag.deleteMany();
}

export async function createTestTags(count: number) {
  return await prisma.tag.createMany({
    data: Array.from({ length: count }).map((_, i) => ({
      id: `test-tag-id-${i}`,
      name: `test-tag-${i}`,
    })),
  });
}

export async function getAllTags() {
  return await prisma.tag.findMany();
}
