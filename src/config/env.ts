import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const env = process.env.NODE_ENV || 'development';
if (env !== 'production') {
  const envFile = `.env.${env}`;
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
const NODE_ENV = env;
const DB_HOST = process.env.DB_HOST!;
const DB_PORT = Number(process.env.DB_PORT!);
const DB_USER = process.env.DB_USER!;
const DB_PASSWORD = process.env.DB_PASSWORD!;
const DB_PRINCIPAL_DATABASE = process.env.DB_PRINCIPAL_DATABASE!;
const PROJECT_BASE_PATH = process.env.PROJECT_BASE_PATH || process.cwd();
const SYNC_INTERVAL_CRON = process.env.SYNC_INTERVAL_CRON!;
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL!;

export const config = {
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_PRINCIPAL_DATABASE,
  PROJECT_BASE_PATH,
  SYNC_INTERVAL_CRON,
  EXTERNAL_API_URL
}


