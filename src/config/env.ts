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
export const NODE_ENV = env;
export const DB_HOST = process.env.DB_HOST!;
export const DB_PORT = Number(process.env.DB_PORT!);
export const DB_USER = process.env.DB_USER!;
export const DB_PASSWORD = process.env.DB_PASSWORD!;
export const DB_PRINCIPAL_DATABASE = process.env.DB_PRINCIPAL_DATABASE!;
export const PROJECT_BASE_PATH = process.env.PROJECT_BASE_PATH || process.cwd();
export const SYNC_INTERVAL_CRON = process.env.SYNC_INTERVAL_CRON!;
export const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL!;
