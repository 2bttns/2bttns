import { PrismaClient } from "@prisma/client";
import { createInnerTRPCContext } from "../../../../src/server/api/trpc";

export const createInnerTRPCContextWithSessionForTest = () => {
  return createInnerTRPCContext({
    session: {
      user: { id: "123", name: "Test" },
      expires: "1",
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
    prisma.tag.deleteMany(),
    prisma.user.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.weight.deleteMany(),
  ];

  await Promise.all(toClear);
}
