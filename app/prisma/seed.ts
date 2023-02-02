import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const exampleGame1 = await prisma.game.create({
    data: {
      id: "example-game-1",
      name: "Example Game 1",
      description: "This is an example game.",
      plugins: "example-plugin-1,example-plugin-2",
    },
  });

  const exampleGame2 = await prisma.game.create({
    data: {
      id: "example-game-2",
      name: "Example Game 2",
      description: "This is another example game.",
    },
  });

  console.log({ exampleGame1, exampleGame2 });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
