import path from 'path';
import dotenv from 'dotenv';

// ✅ Carga el archivo .env desde la raíz del proyecto, sin importar desde dónde ejecutes
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

// ✅ Solo para depurar: imprime el valor de DB_PASSWORD
console.log('📦 DB_PASSWORD =', process.env.DB_PASSWORD);

export const config = {
  DB_HOST: process.env.DB_HOST ?? '',
  DB_PORT: parseInt(process.env.DB_PORT ?? '5432', 10),
  DB_USER: process.env.DB_USER ?? '',
  DB_PASSWORD: process.env.DB_PASSWORD ?? '',
  DB_PRINCIPAL_DATABASE: process.env.DB_PRINCIPAL_DATABASE ?? '',
  DB_SYNC: process.env.DB_SYNC ?? '',
  PROJECT_BASE_PATH: process.env.PROJECT_BASE_PATH ?? '',
  EXTERNAL_API_URL: process.env.EXTERNAL_API_URL ?? 'http://localhost:3000',
  SYNC_INTERVAL_CRON: process.env.SYNC_INTERVAL_CRON ?? '*/5 * * * *',
  NODE_ENV: process.env.NODE_ENV ?? 'development',

  DOCUMENT_SERIE: process.env.DOCUMENT_SERIE ?? '',
  SYNC_API_KEY: process.env.SYNC_API_KEY ?? '',
};

