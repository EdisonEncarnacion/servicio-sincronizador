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
import { formatError } from '../utils/error-utils';

async function processNewDocuments(conn: any, tenant: TenantInfo) {
    const schema = tenant.schemaName;
    const docs = await fetchNewDocuments(conn, schema);
    logger.info(`Tenant ${schema}: ${docs.length} documentos nuevos`);
    for (const doc of docs) {
        const documentNumber = doc.series + '-' + doc.number;
        try {
            // logStateChange(doc, schema);
            const { status, data
                , uploadFiles
            } = await uploadSendToExternalApi(doc, schema, tenant);
            if (status) {
                await markMigrated(conn, schema, doc.id, doc.state_type_id, 'migrated', uploadFiles, data.cpeId);
                logger.info(`(NEW) Tenant ${schema}: sincronizado ${documentNumber}`);
            } else {
                logger.warn(`(NEW) Tenant ${schema}: API !=200 para ${documentNumber}`);
            }
        } catch (err: any) {
            logger.error(`(NEW) Tenant ${schema}: error ${documentNumber} -> ${err.message ? '' : err}`);
        }
    }
}
async function processUpdatedDocuments(conn: any, tenant: TenantInfo) {
    const schema = tenant.schemaName;
    const docs = await fetchUpdatedDocuments(conn, schema);
    logger.info(`Tenant ${schema}: ${docs.length} documentos actualizados`);
    for (const doc of docs) {
        const documentNumber = doc.series + '-' + doc.number;
        try {
            // logStateChange(doc, schema);
            const { status, data, uploadFiles } = await updateSendToExternalApi(doc, !doc.migrated_files, schema, tenant);
            if (status) {
                await markMigrated(conn, schema, doc.id, doc.state_type_id, 'updated', uploadFiles);
                logger.info(`(UPDATE) Tenant ${schema}: sincronizado ${documentNumber}`);
            } else {
                logger.warn(`(UPDATE) Tenant ${schema}: API !=200 para ${documentNumber}`);
            }
        } catch (err: any) {
            const str = formatError(err, { schema, documentNumber, module: 'migrator' });
            logger.error(str);
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

