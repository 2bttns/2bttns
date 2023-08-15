import { PrismaClient } from "@prisma/client";
import { applySeed } from "./utils/applySeed";
const prisma = new PrismaClient();
applySeed(prisma).catch(console.error);
