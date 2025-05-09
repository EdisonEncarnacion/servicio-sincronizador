import { createTenantConnection } from '../config/db';
import { logger } from '../utils/logger';
import { ensureMigrationColumns, listTenantsData, markMigrated } from './database-service';
import {
    fetchNewDocuments,
    fetchUpdatedDocuments,
    logStateChange
} from './document.service';
import { updateDispatchToExternalApi, updateSendToExternalApi, uploadDispatchToExternalApi, uploadSendToExternalApi } from './send-api.service';
import { TenantInfo } from '../types/tenant.interface';
import { formatError } from '../utils/error-utils';
import { TableName } from '../config/table-names';
import { fetchNewDispatches, fetchUpdatedDispatches } from './dispatch.service';
async function processNewDocuments(conn: any, tenant: TenantInfo) {
    const schema = tenant.schemaName;
    const docs = await fetchNewDocuments(conn, schema);
    if (docs.length > 0) {
        logger.info(tenant)
        logger.info(`Tenant ${schema}: ${docs.length} documentos nuevos`);
    }
    for (const doc of docs) {
        const documentNumber = doc.series + '-' + doc.number;
        try {
            const { status, data
                , uploadFiles
            } = await uploadSendToExternalApi(doc, schema, tenant);
            if (status) {
                await markMigrated(conn, schema, TableName.DOCUMENTS, doc.id, doc.state_type_id, 'migrated', uploadFiles, data.cpeId);
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
    if (docs.length > 0) {
        logger.info(tenant)
        logger.info(`Tenant ${schema}: ${docs.length} documentos actualizados`);
    }
    for (const doc of docs) {
        const documentNumber = doc.series + '-' + doc.number;
        try {
            //siempre subir archivos en una actualización
            const { status, data, uploadFiles } = await updateSendToExternalApi(doc, true, schema, tenant);
            if (status) {
                await markMigrated(conn, schema, TableName.DOCUMENTS, doc.id, doc.state_type_id, 'updated', uploadFiles);
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
async function processNewDispatches(conn: any, tenant: TenantInfo) {
    const schema = tenant.schemaName;
    const disp = await fetchNewDispatches(conn, schema);
    if (disp.length > 0) {
        logger.info(tenant)
        logger.info(`Tenant ${schema}: ${disp.length} guías nuevas`);
    }
    for (const d of disp) {
        try {
            const { status, data, uploadFiles } = await uploadDispatchToExternalApi(conn, d, schema, tenant);
            if (status) {
                await markMigrated(conn, schema, TableName.DISPATCHES, d.id, d.state_type_id.toString(), 'migrated', uploadFiles, data.cpeId);
                logger.info(`(NEW DISP) Tenant ${schema}: sincronizado ${d.filename}`);
            } else {
                logger.warn(`(NEW DISP) Tenant ${schema}: API !=200 para ${d.filename}`);
            }
        } catch (err: any) {
            logger.error(`(NEW DISP) Tenant ${schema}: error ${d.filename} -> ${err.message}`);
            console.log(err)
        }
    }
}
async function processUpdatedDispatches(conn: any, tenant: TenantInfo) {
    const schema = tenant.schemaName;
    const disp = await fetchUpdatedDispatches(conn, schema);
    if (disp.length > 0) {
        logger.info(tenant)
        logger.info(`Tenant ${schema}: ${disp.length} guías actualizadas`);
    }
    for (const d of disp) {
        try {
            const { status, uploadFiles } = await updateDispatchToExternalApi(
                d,
                true,
                schema,
                tenant
            );
            if (status) {
                await markMigrated(
                    conn,
                    schema,
                    TableName.DISPATCHES,
                    d.id,
                    d.state_type_id.toString(),
                    'updated',
                    uploadFiles
                );
                logger.info(`(UPDATE DISP) Tenant ${schema}: sincronizado ${d.filename}`);
            } else {
                logger.warn(`(UPDATE DISP) Tenant ${schema}: API !=200 para ${d.filename}`);
            }
        } catch (err: any) {
            logger.error(`(UPDATE DISP) Tenant ${schema}: error ${d.filename} -> ${err.message}`);
        }
    }
}
export async function syncAllTenants() {
    const tenantsData = await listTenantsData();
    for (const tenant of tenantsData) {
        const { schemaName } = tenant
        const conn = await createTenantConnection(schemaName);
        try {
            await ensureMigrationColumns(conn, schemaName, TableName.DOCUMENTS);
            await ensureMigrationColumns(conn, schemaName, TableName.DISPATCHES);
            await processNewDocuments(conn, tenant);
            await processUpdatedDocuments(conn, tenant);
            await processNewDispatches(conn, tenant);
            await processUpdatedDispatches(conn, tenant);
        } catch (prepErr: any) {
            logger.error(`Tenant ${schemaName}: error preparación -> ${prepErr.message}`);
        } finally {
            await conn.end();
        }
    }
}

