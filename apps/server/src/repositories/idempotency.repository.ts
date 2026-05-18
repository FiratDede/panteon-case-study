import type { IdempotencyKey, PrismaClient } from "@prisma/client";
import { prisma } from "../db/prisma.js";

export class IdempotencyRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async start(scope: string, key: string, requestHash: string): Promise<IdempotencyKey | null> {
    try {
      return await this.db.idempotencyKey.create({
        data: {
          scope,
          key,
          requestHash,
          status: "IN_PROGRESS"
        }
      });
    } catch {
      return null;
    }
  }

  find(scope: string, key: string) {
    return this.db.idempotencyKey.findUnique({
      where: {
        scope_key: { scope, key }
      }
    });
  }

  complete(scope: string, key: string, responseBody: unknown) {
    return this.db.idempotencyKey.update({
      where: {
        scope_key: { scope, key }
      },
      data: {
        status: "COMPLETED",
        responseBody: responseBody as object
      }
    });
  }

  fail(scope: string, key: string) {
    return this.db.idempotencyKey.update({
      where: {
        scope_key: { scope, key }
      },
      data: { status: "FAILED" }
    });
  }
}
