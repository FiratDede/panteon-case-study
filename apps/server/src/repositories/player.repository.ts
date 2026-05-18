import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../db/prisma.js";

export class PlayerRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  findByPlayerName(playerName: string) {
    return this.db.player.findUnique({ where: { playerName } });
  }

  findByIds(playerIds: string[]) {
    if (playerIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.db.player.findMany({
      where: { id: { in: playerIds } }
    });
  }

  incrementTotalMoney(playerId: string, amount: bigint, tx: Prisma.TransactionClient | PrismaClient = this.db) {
    return tx.player.update({
      where: { id: playerId },
      data: {
        totalMoney: {
          increment: amount
        }
      }
    });
  }
}
