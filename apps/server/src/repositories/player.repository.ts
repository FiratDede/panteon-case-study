import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../db/prisma";

export async function findPlayerByName(playerName: string, db: PrismaClient = prisma) {
  return await db.player.findUnique({ where: { playerName } });
}

export async function findPlayersByIds(playerIds: number[], db: PrismaClient = prisma) {
  if (playerIds.length === 0) {
    return [];
  }

  return await db.player.findMany({
    where: { id: { in: playerIds } }
  });
}

export async function incrementPlayerTotalMoney(
  playerId: number,
  amount: bigint,
  db: Prisma.TransactionClient | PrismaClient = prisma
) {
  return await db.player.update({
    where: { id: playerId },
    data: {
      totalMoney: {
        increment: amount
      }
    }
  });
}
