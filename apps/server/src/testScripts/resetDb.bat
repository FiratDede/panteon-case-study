@echo off
setlocal
chcp 65001 > nul

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%\..\..\..\..") do set "REPO_DIR=%%~fI"
for %%I in ("%SCRIPT_DIR%\..\..") do set "SERVER_DIR=%%~fI"
pushd "%SERVER_DIR%"

set "PLAYER_COUNT=2000000"
if not "%~1"=="" set "PLAYER_COUNT=%~1"
for /f %%i in ('node -e "const d=new Date();d.setUTCDate(d.getUTCDate()-7);const p=n=>String(n).padStart(2,String.fromCharCode(48));console.log(d.getUTCFullYear()+String.fromCharCode(47)+p(d.getUTCMonth()+1)+String.fromCharCode(47)+p(d.getUTCDate()))"') do set "PREVIOUS_WEEK_DATE=%%i"

echo Resetting PostgreSQL with Prisma...
call npx prisma migrate reset --force
if errorlevel 1 goto error

echo Applying migrations...
call npm run prisma:migrate
if errorlevel 1 goto error

echo Flushing local Redis...
docker compose --project-directory "%REPO_DIR%" exec redis redis-cli FLUSHALL
if errorlevel 1 goto error

echo Seeding %PLAYER_COUNT% players...
call npx tsx src/testScripts/seedPlayers.ts %PLAYER_COUNT%
if errorlevel 1 goto error

echo Seeding current week scores...
call npx tsx src/testScripts/seedScores.ts %PLAYER_COUNT%
if errorlevel 1 goto error

echo Seeding previous week scores...
call npx tsx src/testScripts/seedScores.ts %PLAYER_COUNT% %PREVIOUS_WEEK_DATE%
if errorlevel 1 goto error

popd
echo Done.
exit /b 0

:error
set "EXIT_CODE=%ERRORLEVEL%"
popd
echo Failed with exit code %EXIT_CODE%.
exit /b %EXIT_CODE%
