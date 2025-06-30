// src/services/sync.service.ts

import { Pool } from 'pg';
import { ensureMigrationColumns } from './database-service';
import { config } from '../config/env';
import { TableName } from '../config/table-names';
import { MIGRATION_COLUMNS_DOCUMENT } from '../config/columns';
import { logger } from '../logger';

import { syncSalesAndDetails } from './sale-sync.service'; // 🧾 ventas
import { syncClients } from './syncClients';       // 👤 clientes

export async function sync(pool: Pool) {
    const client = await pool.connect();
    try {
        logger.log('Iniciando sincronización');

        // 1. Asegurar columnas necesarias para otras tablas (ej: sale_notes)
        await ensureMigrationColumns(client, config.DB_SYNC ?? '', TableName.SALE_NOTES, MIGRATION_COLUMNS_DOCUMENT);

        // 2. Sincronizar ventas y detalles
        await syncSalesAndDetails(client);

        // 3. Sincronizar clientes
        await syncClients(client);

        logger.log('Sincronización completada');
    } catch (prepErr: any) {
        logger.error(`Error general en sync: ${prepErr.message}`);
    } finally {
        client.release();
    }
}
