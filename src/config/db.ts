import mysql from 'mysql2/promise';
import { config } from './env';
import { logger } from '../logger';

const COMMON_OPTIONS: mysql.PoolOptions = {
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
};
export async function createDatabaseConnection() {
    const conexion = await mysql.createConnection({
        ...COMMON_OPTIONS,
        database: config.DB_SYNC,
    });
    if (conexion) {
       logger.log(`Conexión a la base de datos ${config.DB_SYNC} establecida correctamente`);
    }
    return conexion;
}
