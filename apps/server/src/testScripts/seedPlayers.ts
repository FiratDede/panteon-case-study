import { randomInt } from "crypto";
import pLimit from "p-limit";
import { chunkArray } from "../common/utils/chunk";
import { prisma } from "../db/prisma"


async function run() {
  if(process.argv.length < 3) {
    throw new Error("You must specify how many players you want to create")
}
const totalCountOfPlayers = Number(process.argv[2])


  const limit = pLimit(5); // aynı anda max 5 işlem

  const data = Array.from({ length: totalCountOfPlayers }, (_, i) => {
    return {
      playerName: `player-${i + 1}`,
    }
  });

  const chunks = chunkArray(data, 1000);

  await Promise.all(
    chunks.map(chunk =>
      limit(() =>
        prisma.player.createMany({
          data: chunk,
          skipDuplicates: true,
        })
      )
    )
  );
  console.log(`${totalCountOfPlayers} players  added.`)
  
}

run();