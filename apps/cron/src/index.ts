import { loadEnv } from "./config/load-env";

async function bootstrap() {
  loadEnv();

  const { startCronApp } = await import("./app");
  await startCronApp();
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
