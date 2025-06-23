import mysql from 'mysql2/promise';
import { getNotesWithStateChange, getSaleNotesWithDocument } from '../datasource/db/sale-note.datasource';
import { ReservationDatasource } from '../datasource/api/reservation-datasource';
import { markMigrated } from './database-service';
import { TableName } from '../config/table-names';
import { config } from '../config/env';
import { logger } from '../logger';

export async function migrateDocumentNumbers(conn: mysql.Connection) {
    const document = await getSaleNotesWithDocument(conn);
    for (const n of document) {
        try {
            await ReservationDatasource.addDocumentNumber(
                n.external_id,
                n.document_number,
                n.state_type_id
            );
            await markMigrated(
                conn,
                config.DB_SYNC ?? '',
                TableName.SALE_NOTES,
                n.id,
                n.state_type_id,
                'migrated',
                n.external_id,
            );
            logger.log(`✅ Enviado doc #${n.document_number} (id ${n.external_id})`);
        } catch (err: any) {
            logger.error(`❌ Error enviando doc #${n.document_number} (id ${n.external_id}):`, err.message);
        }
    }
    const changes = await getNotesWithStateChange(conn);
    for (const c of changes) {
        try {
            await ReservationDatasource.updateDocumentState(
                c.external_id,
                c.new_state,
            );
            await markMigrated(
                conn,
                config.DB_SYNC ?? '',
                TableName.SALE_NOTES,
                c.id,
                c.new_state,
                'updated',
            );
            logger.log(`✅ Actualizado estado de doc ${c.external_id} a ${c.new_state}`);
        } catch (e: any) {
            logger.error(`❌ updState ${c.external_id}: ${e.message}`);
        }
    }


}
