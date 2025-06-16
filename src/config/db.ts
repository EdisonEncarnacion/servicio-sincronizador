import mysql from 'mysql2/promise';
import { config } from './env';

const COMMON_OPTIONS: mysql.PoolOptions = {
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
};
export async function createDatabaseConnection() {
    return mysql.createConnection({
        ...COMMON_OPTIONS,
        database: config.DB_PRINCIPAL_DATABASE,
    });
}
