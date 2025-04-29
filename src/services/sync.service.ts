import { createTenantConnection } from '../config/db';
import { logger } from '../utils/logger';
import { ensureMigrationColumns, listTenantsData, markMigrated } from './database-service';
import {
    fetchNewDocuments,
    fetchUpdatedDocuments,
    logStateChange
} from './document.service';
import { sendToExternalApi } from './send-api.service';
import { determineFinalState } from '../utils/stateHelper';
import { TenantInfo } from '../types/tenant.interface';

async function processNewDocuments(conn: any, tenant: TenantInfo) {
    const schema = tenant.schemaName;
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
            const ok = await sendToExternalApi(doc, schema, tenant);
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
async function processUpdatedDocuments(conn: any, tenant: TenantInfo) {
    const schema = tenant.schemaName;
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
            const ok = await sendToExternalApi(doc, schema,tenant);
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
    const tenantsData = await listTenantsData();
    for (const tenant of tenantsData) {
        console.log(tenant)
        const { schemaName } = tenant
        logger.info(`**** Tenant: ${schemaName} ****`);
        const conn = await createTenantConnection(schemaName);
        try {
            await ensureMigrationColumns(conn, schemaName);
            await processNewDocuments(conn, tenant);
            console.log('_'.repeat(100));
            // await processUpdatedDocuments(conn, schema);
        } catch (prepErr: any) {
            logger.error(`Tenant ${schemaName}: error preparación -> ${prepErr.message}`);
        } finally {
            await conn.end();
        }
    }
}

