import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: path.resolve(process.cwd(), '.env'),
});

export const DB_HOST = process.env.DB_HOST!;
export const DB_PORT = Number(process.env.DB_PORT!);
export const DB_USER = process.env.DB_USER!;
export const DB_PASSWORD = process.env.DB_PASSWORD!;
export const DB_PRINCIPAL_DATABASE = process.env.DB_PRINCIPAL_DATABASE!;
export const PROJECT_BASE_PATH = process.env.PROJECT_BASE_PATH || process.cwd();
// Cron y sincronización
export const SYNC_INTERVAL_CRON = process.env.SYNC_INTERVAL_CRON!;

// API externa
export const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL!;
