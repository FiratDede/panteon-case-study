import { config } from "dotenv";

export function loadEnv() {
  if (process.env.DOTENV_CONFIG_PATH) {
    config({ path: process.env.DOTENV_CONFIG_PATH });
    return;
  }

  config();
}
