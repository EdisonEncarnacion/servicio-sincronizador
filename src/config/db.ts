import { Pool } from 'pg';
import { config } from './env';
import { logger } from '../logger';

const pool = new Pool({
  host: config.DB_HOST,
  port: Number(config.DB_PORT),
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_PRINCIPAL_DATABASE,
});

export async function createDatabaseConnection(): Promise<Pool> {
  try {
    const client = await pool.connect();

    logger.log(`Conexión a la base de datos ${config.DB_SYNC} establecida correctamente`);
    client.release();

    return pool;
  } catch (error) {
    logger.error('Error al conectar con la base de datos', String(error));
    throw error;
  }
}
