import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const weekId = process.env.ACTIVE_WEEK_ID ?? "2026-W21";

async function main() {
  const startsAt = new Date("2026-05-18T00:00:00.000Z");
  const endsAt = new Date("2026-05-25T00:00:00.000Z");

  await prisma.weeklyLeaderboard.upsert({
    where: { weekId },
    update: { startsAt, endsAt, status: "ACTIVE" },
    create: { weekId, startsAt, endsAt, status: "ACTIVE" }
  });

  for (let index = 1; index <= 150; index += 1) {
    const playerName = `player-${index.toString().padStart(3, "0")}`;
    const player = await prisma.player.upsert({
      where: { playerName },
      update: {},
      create: {
        playerName,
        displayName: `Player ${index}`,
        country: index % 3 === 0 ? "TR" : index % 3 === 1 ? "US" : "DE",
        totalMoney: BigInt(100_000 + index)
      }
    });

    await prisma.playerWeeklyScore.upsert({
      where: { weekId_playerId: { weekId, playerId: player.id } },
      update: { score: BigInt((151 - index) * 10_000) },
      create: {
        weekId,
        playerId: player.id,
        score: BigInt((151 - index) * 10_000)
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
