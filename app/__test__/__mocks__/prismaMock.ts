// libs/__mocks__/prisma.ts
import { PrismaClient } from "@prisma/client";
import { beforeEach } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

beforeEach(() => {
  mockReset(prismaMock);
});

const prismaMock = mockDeep<PrismaClient>();
export default prismaMock;
