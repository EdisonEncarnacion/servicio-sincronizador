import { createDatabaseConnection } from '../config/db';
import { ReservationService } from './reservation.service';
import { importReservation } from './sale-note-import.service';
import { ensureMigrationColumns } from './database-service';
import { config } from '../config/env';
import { TableName } from '../config/table-names';
import { MIGRATION_COLUMNS_DOCUMENT } from '../config/columns';
import mysql from 'mysql2/promise';
import { migrateDocumentNumbers } from './document-number-migrate.service';
import { logger } from '../logger';

export async function sync(conn: mysql.Connection) {
    try {
        const pendings = await ReservationService.getPending(); 
        if (pendings.length === 0) {
            logger.log('No hay reservas pendientes para importar', 'Sync');
            return;
        }
        for (const p of pendings) {
            try {
                await importReservation(conn, p);
                logger.log(`Reserva ${p.codigoReserva} importada ✅`);
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
