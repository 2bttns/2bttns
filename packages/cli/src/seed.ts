import { PrismaClient } from ".";
import { applySeed } from "../../../app/prisma/utils/applySeed";

export async function seed(prisma: PrismaClient) {
  await applySeed(prisma);
}
