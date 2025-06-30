// src/services/client-sync.service.ts
import { PoolClient } from 'pg';
import { logger } from '../logger';
import { BackofficeAPI } from '../datasource/api/backoffice-api';
import { mapClients } from '../mappings/id-maps';

export async function syncClients(client: PoolClient) {
    try {
        logger.log('🔄 Buscando clientes nuevos para sincronizar');

        const { rows: clients } = await client.query(`
            SELECT id_client, client_code FROM client
        `);

        for (const clientRow of clients) {
            const mappedId = mapClients[clientRow.id_client];

            if (!mappedId) {
                logger.error(`❌ Cliente con id_client = ${clientRow.id_client} no tiene UUID mapeado`);
                continue;
            }

            try {
                await BackofficeAPI.insertClient({
                    id_client: mappedId,
                    client_code: clientRow.client_code?.toString() || 'SIN-CODIGO',
                });

                logger.log(`✅ Cliente ${clientRow.id_client} sincronizado como UUID ${mappedId}`);
            } catch (apiError: any) {
                const errorMessage = apiError.response?.data || apiError.message || apiError;
                logger.error(`❌ Error al sincronizar cliente ${clientRow.id_client}: ${JSON.stringify(errorMessage)}`);
            }
        }
    } catch (err: any) {
        logger.error(`❌ Error en syncClients: ${err.message}`);
    }
}
