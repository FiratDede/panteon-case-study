import { PrismaClient } from "@prisma/client";
import { getCurrentWeekId, getDefaultWeekWindow } from "@panteon/shared";

const prisma = new PrismaClient();

const weekId = getCurrentWeekId();

async function main() {
  const { startsAt, endsAt } = getDefaultWeekWindow(weekId);

  await prisma.weeklyLeaderboard.upsert({
    where: { weekId },
    update: { startsAt, endsAt, status: "ACTIVE" },
    create: { weekId, startsAt, endsAt, status: "ACTIVE" }
  });

  for (let index = 1; index <= 150; index += 1) {
    const playerName = `player-${index.toString().padStart(3, "0")}`;
    await prisma.player.upsert({
      where: { playerName },
      update: {},
      create: {
        playerName,
        totalMoney: BigInt(100_000 + index)
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
