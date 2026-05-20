import { MongoClient } from "mongodb";
import { env } from "../config/env";

export const mongoClient = new MongoClient(env.MONGODB_URL);

export async function connectMongo() {
  await mongoClient.connect();
  return mongoClient.db(env.MONGODB_DB);
}

export function getMongoDb() {
  return mongoClient.db(env.MONGODB_DB);
}
