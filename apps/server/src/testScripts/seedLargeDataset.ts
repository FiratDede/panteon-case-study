import { spawn } from "child_process";

const PLAYER_AND_SCORE_COUNT = 2_000_000;

function formatSeedDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
}

function getPreviousWeekSeedDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 7);
  return formatSeedDate(date);
}

async function runScript(scriptPath: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn("npx", ["tsx", scriptPath, ...args], {
      shell: true,
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${scriptPath} exited with code ${code}`));
    });
  });
}

async function run() {
  const count = PLAYER_AND_SCORE_COUNT.toString();
  const previousWeekDate = getPreviousWeekSeedDate();

  console.log(`Seeding ${count} players.`);
  await runScript("src/testScripts/seedPlayers.ts", [count]);

  console.log(`Seeding ${count} current week scores.`);
  await runScript("src/testScripts/seedScores.ts", [count]);

  console.log(`Seeding ${count} previous week scores for ${previousWeekDate}.`);
  await runScript("src/testScripts/seedScores.ts", [count, previousWeekDate]);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
