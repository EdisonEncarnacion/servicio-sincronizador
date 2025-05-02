import { createTenantConnection } from '../config/db';
import { logger } from '../utils/logger';
import { ensureMigrationColumns, listTenantsData, markMigrated } from './database-service';
import {
    fetchNewDocuments,
    fetchUpdatedDocuments,
    logStateChange
} from './document.service';
import { updateSendToExternalApi, uploadSendToExternalApi } from './send-api.service';
import { TenantInfo } from '../types/tenant.interface';

async function processNewDocuments(conn: any, tenant: TenantInfo) {
    const schema = tenant.schemaName;
    const docs = await fetchNewDocuments(conn, schema);
    logger.info(`Tenant ${schema}: ${docs.length} documentos nuevos`);
    for (const doc of docs) {
        /* const state = determineFinalState(doc);
        logger.info(`(NEW) Tenant ${schema}: estado calculado = ${state}`);
        if (state === 'PENDIENTE') {
            logger.warn(`(NEW) Tenant ${schema}: documento ${doc.external_id} aún pendiente, se salta`);
            continue;
        } */
        try {
            logStateChange(doc, schema);
            const { status, data } = await uploadSendToExternalApi(doc, schema, tenant);
            if (status) {
                await markMigrated(conn, schema, doc.id, doc.state_type_id, 'migrated', data.cpeId);
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
        /* const state = determineFinalState(doc);
        logger.info(`(UPDATE) Tenant ${schema}: estado calculado = ${state}`);
        if (state === 'PENDIENTE') {
            logger.warn(`(UPDATE) Tenant ${schema}: documento ${doc.external_id} aún pendiente, se salta`);
            continue;
        } */
        try {
            logStateChange(doc, schema);
            const { status, data } = await updateSendToExternalApi(doc)
            if (status) {
                await markMigrated(conn, schema, doc.id, doc.state_type_id,  'updated');
                logger.info(`(NEW) Tenant ${schema}: sincronizado ${doc.external_id}`);
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
            await processUpdatedDocuments(conn, tenant);
        } catch (prepErr: any) {
            logger.error(`Tenant ${schemaName}: error preparación -> ${prepErr.message}`);
        } finally {
            await conn.end();
        }
    }
}

