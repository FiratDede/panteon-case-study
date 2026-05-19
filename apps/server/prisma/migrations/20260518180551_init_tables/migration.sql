-- CreateEnum
CREATE TYPE "WeeklyLeaderboardStatus" AS ENUM ('ACTIVE', 'FINALIZING', 'FINALIZED');

-- CreateEnum
CREATE TYPE "RewardPayoutStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "IdempotencyStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "player_name" TEXT NOT NULL,
    "total_money" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_weekly_scores" (
    "id" TEXT NOT NULL,
    "week_id" TEXT NOT NULL,
    "player_id" INTEGER NOT NULL,
    "score" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_weekly_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_leaderboards" (
    "id" TEXT NOT NULL,
    "week_id" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "prize_pool" BIGINT NOT NULL DEFAULT 0,
    "status" "WeeklyLeaderboardStatus" NOT NULL DEFAULT 'ACTIVE',
    "finalized_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_leaderboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_leaderboard_entries" (
    "id" TEXT NOT NULL,
    "weekly_leaderboard_id" TEXT NOT NULL,
    "player_id" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_leaderboard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_payouts" (
    "id" TEXT NOT NULL,
    "weekly_leaderboard_id" TEXT NOT NULL,
    "player_id" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "amount" BIGINT NOT NULL,
    "status" "RewardPayoutStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "response_body" JSONB,
    "status" "IdempotencyStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_player_name_key" ON "players"("player_name");

-- CreateIndex
CREATE INDEX "player_weekly_scores_week_id_score_idx" ON "player_weekly_scores"("week_id", "score");

-- CreateIndex
CREATE UNIQUE INDEX "player_weekly_scores_week_id_player_id_key" ON "player_weekly_scores"("week_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_leaderboards_week_id_key" ON "weekly_leaderboards"("week_id");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_leaderboard_entries_weekly_leaderboard_id_player_id_key" ON "weekly_leaderboard_entries"("weekly_leaderboard_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_leaderboard_entries_weekly_leaderboard_id_rank_key" ON "weekly_leaderboard_entries"("weekly_leaderboard_id", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "reward_payouts_weekly_leaderboard_id_player_id_key" ON "reward_payouts"("weekly_leaderboard_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_scope_key_key" ON "idempotency_keys"("scope", "key");

-- AddForeignKey
ALTER TABLE "player_weekly_scores" ADD CONSTRAINT "player_weekly_scores_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_leaderboard_entries" ADD CONSTRAINT "weekly_leaderboard_entries_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_leaderboard_entries" ADD CONSTRAINT "weekly_leaderboard_entries_weekly_leaderboard_id_fkey" FOREIGN KEY ("weekly_leaderboard_id") REFERENCES "weekly_leaderboards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_payouts" ADD CONSTRAINT "reward_payouts_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_payouts" ADD CONSTRAINT "reward_payouts_weekly_leaderboard_id_fkey" FOREIGN KEY ("weekly_leaderboard_id") REFERENCES "weekly_leaderboards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
