import { PoolClient } from 'pg';
import { getNotesWithStateChange, getSaleNotesWithDocument } from '../datasource/db/sale-note.datasource';
import { markMigrated } from './database-service';
import { TableName } from '../config/table-names';
import { config } from '../config/env';
import { logger } from '../logger';

export async function migrateDocumentNumbers(conn: PoolClient) {
    const documents = await getSaleNotesWithDocument(conn);

    for (const n of documents) {
        try {
            // Ya no se envía al otro sistema
            await markMigrated(
                conn,
                config.DB_SYNC ?? '',
                TableName.SALE_NOTES,
                n.id,
                n.state_type_id,
                'migrated',
                n.external_id
            );

            logger.log(`✅ Documento marcado como migrado localmente: #${n.document_number} (id ${n.external_id})`);
        } catch (err: unknown) {
            if (err instanceof Error) {
                logger.error(`❌ Error marcando doc #${n.document_number} (id ${n.external_id}): ${err.message}`);
            } else {
                logger.error(`❌ Error desconocido marcando doc #${n.document_number} (id ${n.external_id})`);
            }
        }
    }

    const changes = await getNotesWithStateChange(conn);

    for (const c of changes) {
        try {
            // Ya no se actualiza el estado en otro sistema
            await markMigrated(
                conn,
                config.DB_SYNC ?? '',
                TableName.SALE_NOTES,
                c.id,
                c.new_state,
                'updated'
            );

            logger.log(`✅ Estado actualizado localmente para doc ${c.external_id} → ${c.new_state}`);
        } catch (err: unknown) {
            if (err instanceof Error) {
                logger.error(`❌ Error actualizando estado de doc ${c.external_id}: ${err.message}`);
            } else {
                logger.error(`❌ Error desconocido en updateState de doc ${c.external_id}`);
            }
        }
    }
}
