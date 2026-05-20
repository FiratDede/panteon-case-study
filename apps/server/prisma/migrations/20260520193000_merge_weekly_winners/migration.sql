CREATE TABLE "weekly_leaderboard_winners" (
    "id" TEXT NOT NULL,
    "weekly_leaderboard_id" TEXT NOT NULL,
    "player_id" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" BIGINT NOT NULL,
    "reward_amount" BIGINT NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_leaderboard_winners_pkey" PRIMARY KEY ("id")
);

INSERT INTO "weekly_leaderboard_winners" (
    "id",
    "weekly_leaderboard_id",
    "player_id",
    "rank",
    "score",
    "reward_amount",
    "paid_at",
    "created_at",
    "updated_at"
)
SELECT
    gen_random_uuid()::text,
    entries."weekly_leaderboard_id",
    entries."player_id",
    entries."rank",
    entries."score",
    payouts."amount",
    COALESCE(payouts."paid_at", payouts."created_at", CURRENT_TIMESTAMP),
    LEAST(entries."created_at", payouts."created_at"),
    GREATEST(entries."created_at", payouts."updated_at")
FROM "weekly_leaderboard_entries" entries
INNER JOIN "reward_payouts" payouts
    ON payouts."weekly_leaderboard_id" = entries."weekly_leaderboard_id"
   AND payouts."player_id" = entries."player_id";

CREATE UNIQUE INDEX "weekly_leaderboard_winners_weekly_leaderboard_id_player_id_key"
    ON "weekly_leaderboard_winners"("weekly_leaderboard_id", "player_id");

CREATE UNIQUE INDEX "weekly_leaderboard_winners_weekly_leaderboard_id_rank_key"
    ON "weekly_leaderboard_winners"("weekly_leaderboard_id", "rank");

CREATE INDEX "weekly_leaderboard_winners_player_id_idx"
    ON "weekly_leaderboard_winners"("player_id");

ALTER TABLE "weekly_leaderboard_winners"
    ADD CONSTRAINT "weekly_leaderboard_winners_player_id_fkey"
    FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "weekly_leaderboard_winners"
    ADD CONSTRAINT "weekly_leaderboard_winners_weekly_leaderboard_id_fkey"
    FOREIGN KEY ("weekly_leaderboard_id") REFERENCES "weekly_leaderboards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP TABLE "reward_payouts";
DROP TABLE "weekly_leaderboard_entries";
DROP TYPE "RewardPayoutStatus";
