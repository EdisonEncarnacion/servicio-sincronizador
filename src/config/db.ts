import mysql from 'mysql2/promise';
import {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_PRINCIPAL_DATABASE,
} from './env';

const COMMON_OPTIONS = {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
};
export async function createPrimaryConnection() {
    return mysql.createConnection({
        ...COMMON_OPTIONS,
        database: DB_PRINCIPAL_DATABASE,
    });
}

export async function createTenantConnection(database: string) {
    return mysql.createConnection({
        ...COMMON_OPTIONS,
        database,
    });
}
