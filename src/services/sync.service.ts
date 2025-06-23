import { createDatabaseConnection } from '../config/db';
import { ReservationService } from './reservation.service';
import { importReservation } from './sale-note-import.service';
import { logger } from '../utils/logger';
import { ensureMigrationColumns } from './database-service';
import { config } from '../config/env';
import { TableName } from '../config/table-names';
import { MIGRATION_COLUMNS_DOCUMENT } from '../config/columns';
import { migrateDocumentNumbers } from './document-number-migrate.service';

export async function sync() {
    const conn = await createDatabaseConnection();
    try {
        await ensureMigrationColumns(conn, config.DB_SYNC ?? '', TableName.SALE_NOTES, MIGRATION_COLUMNS_DOCUMENT);
        // 1. Todas las reservas por facturar
        const pendings = await ReservationService.getPending();
        // 2. Recorremos una por una
        for (const p of pendings) {
            try {
                await importReservation(conn, p);
                logger.info(`Reserva ${p.codigoReserva} importada ✅`);
            } catch (err: any) {
                logger.error(`Error en ${p.codigoReserva}: ${err.message}`);
            }
        }
        await migrateDocumentNumbers(conn);
    } catch (prepErr: any) {
        logger.error(`Error: ${prepErr.message}`);
    } finally {
        await conn.end();
    }
}
