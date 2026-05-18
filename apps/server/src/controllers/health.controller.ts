import type { Request, Response } from "express";
import { getMongoDb } from "../db/mongo.js";
import { prisma } from "../db/prisma.js";
import { redis } from "../db/redis.js";

export async function getHealth(_request: Request, response: Response) {
  await Promise.all([prisma.$queryRaw`SELECT 1`, redis.ping(), getMongoDb().command({ ping: 1 })]);

  response.json({
    status: "ok",
    dependencies: {
      postgres: "ok",
      redis: "ok",
      mongo: "ok"
    }
  });
}
