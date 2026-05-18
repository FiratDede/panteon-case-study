import type { IdempotencyKey, PrismaClient } from "@prisma/client";
import { prisma } from "../db/prisma";

export async function startIdempotencyKey(
  scope: string,
  key: string,
  requestHash: string,
  db: PrismaClient = prisma
): Promise<IdempotencyKey | null> {
  try {
    return await db.idempotencyKey.create({
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

export function findIdempotencyKey(scope: string, key: string, db: PrismaClient = prisma) {
  return db.idempotencyKey.findUnique({
    where: {
      scope_key: { scope, key }
    }
  });
}

export function completeIdempotencyKey(scope: string, key: string, responseBody: unknown, db: PrismaClient = prisma) {
  return db.idempotencyKey.update({
    where: {
      scope_key: { scope, key }
    },
    data: {
      status: "COMPLETED",
      responseBody: responseBody as object
    }
  });
}

export function failIdempotencyKey(scope: string, key: string, db: PrismaClient = prisma) {
  return db.idempotencyKey.update({
    where: {
      scope_key: { scope, key }
    },
    data: { status: "FAILED" }
  });
}
