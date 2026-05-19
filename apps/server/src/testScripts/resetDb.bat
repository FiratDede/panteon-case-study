@echo on
chcp 65001 > nul

cd /d "C:\Users\dedef\OneDrive\Masaüstü\Work\Panteon\panteon-case-study\apps\server"

call npx prisma migrate reset

call npm run prisma:migrate

cd /d "C:\Users\dedef\OneDrive\Masaüstü\Work\Panteon\panteon-case-study\apps\server\src\testScripts"

call  ts-node seedPlayers.ts 2000000

call  ts-node seedScores.ts 2000000

echo Exit code: %ERRORLEVEL%

pause