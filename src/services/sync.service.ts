import { createTenantConnection } from '../config/db';
import { logger } from '../utils/logger';
import { ensureMigrationColumns, listTenants, markMigrated } from './database-service';
import {
    fetchNewDocuments,
    fetchUpdatedDocuments,
    logStateChange
} from './document.service';
import { sendToExternalApi } from './send-api.service';
import { determineFinalState } from '../utils/stateHelper';

async function processNewDocuments(conn: any, schema: string) {
    const docs = await fetchNewDocuments(conn, schema);
    logger.info(`Tenant ${schema}: ${docs.length} documentos nuevos`);
    for (const doc of docs) {
        const state = determineFinalState(doc);
        logger.info(`(NEW) Tenant ${schema}: estado calculado = ${state}`);
        if (state === 'PENDIENTE') {
            logger.warn(`(NEW) Tenant ${schema}: documento ${doc.external_id} aún pendiente, se salta`);
            continue;
        }
        try {
            logStateChange(doc, schema);
            const ok = await sendToExternalApi(doc, schema);
            if (ok) {
                await markMigrated(conn, schema, doc.id);
                logger.info(`(NEW) Tenant ${schema}: sincronizado ${doc.external_id}`);
            } else {
                logger.warn(`(NEW) Tenant ${schema}: API !=200 para ${doc.external_id}`);
            }
        } catch (err: any) {
            logger.error(`(NEW) Tenant ${schema}: error ${doc.external_id} -> ${err.message}`);
        }
    }
}
async function processUpdatedDocuments(conn: any, schema: string) {
    const docs = await fetchUpdatedDocuments(conn, schema);
    logger.info(`Tenant ${schema}: ${docs.length} documentos actualizados`);
    for (const doc of docs) {
        const state = determineFinalState(doc);
        logger.info(`(UPDATE) Tenant ${schema}: estado calculado = ${state}`);
        if (state === 'PENDIENTE') {
            logger.warn(`(UPDATE) Tenant ${schema}: documento ${doc.external_id} aún pendiente, se salta`);
            continue;
        }

        try {
            logStateChange(doc, schema);
            const ok = await sendToExternalApi(doc, schema);
            if (ok) {
                await markMigrated(conn, schema, doc.id);
                logger.info(`(UPDATE) Tenant ${schema}: sincronizado ${doc.external_id}`);
            } else {
                logger.warn(`(UPDATE) Tenant ${schema}: API !=200 para ${doc.external_id}`);
            }
        } catch (err: any) {
            logger.error(`(UPDATE) Tenant ${schema}: error ${doc.external_id} -> ${err.message}`);
        }
    }
}

export async function syncAllTenants() {
    const tenants = await listTenants();
    for (const schema of tenants) {
        logger.info(`**** Tenant: ${schema} ****`);
        const conn = await createTenantConnection(schema);
        try {
            await ensureMigrationColumns(conn, schema);
            await processNewDocuments(conn, schema);
            console.log('_'.repeat(100));
            // await processUpdatedDocuments(conn, schema);
        } catch (prepErr: any) {
            logger.error(`Tenant ${schema}: error preparación -> ${prepErr.message}`);
        } finally {
            await conn.end();
        }
    }
}

export { listTenants };
