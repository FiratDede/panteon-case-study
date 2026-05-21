#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
SERVER_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)"
PLAYER_COUNT="${1:-2000000}"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
PREVIOUS_WEEK_DATE="$(node -e 'const d = new Date(); d.setUTCDate(d.getUTCDate() - 7); const p = n => String(n).padStart(2, "0"); console.log(`${d.getUTCFullYear()}/${p(d.getUTCMonth() + 1)}/${p(d.getUTCDate())}`);')"

cd "$SERVER_DIR"

echo "Resetting PostgreSQL with Prisma..."
npx prisma migrate reset --force

echo "Applying migrations..."
npm run prisma:migrate

echo "Flushing Redis at ${REDIS_HOST}:${REDIS_PORT}..."
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" FLUSHALL

echo "Seeding ${PLAYER_COUNT} players..."
npx tsx src/testScripts/seedPlayers.ts "$PLAYER_COUNT"

echo "Seeding current week scores..."
npx tsx src/testScripts/seedScores.ts "$PLAYER_COUNT"

echo "Seeding previous week scores..."
npx tsx src/testScripts/seedScores.ts "$PLAYER_COUNT" "$PREVIOUS_WEEK_DATE"

echo "Done."
