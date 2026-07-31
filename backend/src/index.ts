import "dotenv/config";
import { getEnv } from "./config/env";
import { initDb } from "./db";
import { createApp } from "./app";

const env = getEnv();
initDb(env.DATABASE_URL);

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
