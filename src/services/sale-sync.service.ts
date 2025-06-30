// src/services/sale-sync.service.ts

import { PoolClient } from 'pg';
import { logger } from '../logger';
import { BackofficeAPI } from '../datasource/api/backoffice-api';
import { transformSaleToBackoffice } from '../utils/transformSale';

export async function syncSalesAndDetails(client: PoolClient) {
    try {
        logger.log('🔄 Buscando ventas nuevas para sincronizar');

        // Consulta solo las ventas que aún no están en sales_synced
        const { rows: sales } = await client.query(`
            SELECT * FROM sale 
            WHERE id_sale NOT IN (SELECT id_sale FROM sales_synced)
        `);

        for (const sale of sales) {
            // 🔍 Solo procesar la venta con document_number 'BA1000000001'


            const { rows: details } = await client.query(
                `SELECT * FROM sale_detail WHERE id_sale = $1`,
                [sale.id_sale]
            );

            const transformed = transformSaleToBackoffice(sale, details);
            logger.log(`📦 Datos transformados de venta ID: ${sale.id_sale}`);
            console.dir(transformed, { depth: null });

            try {
                await BackofficeAPI.insertSale(transformed);

                await client.query(
                    `INSERT INTO sales_synced (id_sale) VALUES ($1)`,
                    [sale.id_sale]
                );

                logger.log(`✅ Venta ${sale.id_sale} sincronizada`);
            } catch (apiError: any) {
                const errorMessage = apiError.response?.data || apiError.message || apiError;
                logger.error(`❌ Error al enviar venta ${sale.id_sale}: ${JSON.stringify(errorMessage)}`);
            }
        }
    } catch (err: any) {
        logger.error(`Error en syncSalesAndDetails: ${err.message}`);
    }
}
