import mysql from 'mysql2/promise';
import { getSaleNotesWithDocument } from '../datasource/db/sale-note.datasource';
import { ReservationDatasource } from '../datasource/api/reservation-datasource';
import { markMigrated } from './database-service';
import { TableName } from '../config/table-names';
import { config } from '../config/env';

export async function migrateDocumentNumbers(conn: mysql.Connection) {
    const notes = await getSaleNotesWithDocument(conn);
    for (const n of notes) {
        try {
            await ReservationDatasource.addDocumentNumber(
                n.external_id,
                n.document_number,
            );
            await markMigrated(
                conn,
                config.DB_SYNC ?? '',
                TableName.SALE_NOTES,
                n.id,
                '200',
                'migrated',
                n.external_id,
            );
        } catch (err: any) {
            console.error(`❌ Error enviando doc #${n.document_number} (id ${n.external_id}):`, err.message);
        }
    }
}
