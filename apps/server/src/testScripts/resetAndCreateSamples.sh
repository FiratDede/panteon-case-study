cd /home/ubuntu/panteon-case-study/apps/server
npx prisma migrate reset

npm run prisma:migrate

REDIS_HOST="panteon-redis.59jfb6.ng.0001.euc1.cache.amazonaws.com"
REDIS_PORT="6379"

echo "Flushing Redis DB..."

redis-cli -h $REDIS_HOST -p $REDIS_PORT FLUSHDB

echo "Done."


cd /home/ubuntu/panteon-case-study/apps/server


ts-node src/testScripts/seedPlayers.ts 2000000

ts-node src/testScripts/seedScores.ts 2000000
# alttaki komut örnek olsun diye geçmiş haftadakileri gösterir.
ts-node src/testScripts/seedScores.ts 2000000 2026/05/12
