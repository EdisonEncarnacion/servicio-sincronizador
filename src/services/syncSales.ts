// src/services/syncSales.ts
import { PoolClient } from 'pg';
import axios from 'axios';
import { logger } from '../logger/logger.service';

export async function syncSales(client: PoolClient) {
  logger.log('🔍 Buscando ventas nuevas o modificadas para sincronizar', 'syncSales');

  try {
    const res = await client.query(`
      SELECT * FROM sale 
      WHERE synced_at IS NULL 
         OR created_at > synced_at 
         OR updated_at > synced_at
    `);

    if (res.rows.length === 0) {
      logger.log('✅ No se encontraron ventas pendientes por sincronizar', 'syncSales');
      return;
    }

    for (const sale of res.rows) {
      const { rows: details } = await client.query(
        `SELECT * FROM sale_detail WHERE id_sale = $1`,
        [sale.id_sale]
      );

      const payload = {
        sale: {
            state: Number(sale.state),
            total_amount: Number(sale.total_amount),
            subtotal: Number(sale.subtotal),
            total_discount: Number(sale.total_discount),
            document_number: String(sale.document_number),
            created_at: sale.created_at,
            updated_at: sale.updated_at,
            op_grabada: Number(sale.op_grabada),
            total_tax: Number(sale.total_tax),
            exonerado: Number(sale.exonerado),
            transferencia_gratuita: Number(sale.transferencia_gratuita),
            id_local: Number(sale.id_local),
            id_sale_document_type: Number(sale.id_sale_document_type),
            id_payment_type: Number(sale.id_payment_type),
            id_cash_register: Number(sale.id_cash_register),
            id_client: Number(sale.id_client),
            id_user: Number(sale.id_user),
          },
          
          sale_details: details.map((detail) => ({
            quantity: Number(detail.quantity),
            id_product: Number(detail.id_product),
            product_price: Number(detail.product_price),
            tax_detail: typeof detail.tax_detail === 'string'
              ? JSON.parse(detail.tax_detail)
              : detail.tax_detail,
            total_amount: Number(detail.total_amount),
            system_date: detail.system_date,
            id_transaction: Number(detail.id_transaction),
            id_side: Number(detail.id_side),
            synced_at: detail.synced_at,
          })),
          
      };

      try {
        logger.debug(`📦 Enviando venta:\n${JSON.stringify(payload, null, 2)}`, 'syncSales');

        await axios.post('http://localhost:3000/sales/full', payload); // ✅


        await client.query(
          'UPDATE sale SET synced_at = NOW() WHERE id_sale = $1',
          [sale.id_sale]
        );

        logger.log(`✅ Venta ${sale.id_sale} sincronizada correctamente`, 'syncSales');
      } catch (err: any) {
        logger.error(`❌ Error al enviar venta ${sale.id_sale}: ${err.message}`, undefined, 'syncSales');
        if (err.response) {
          logger.error(`📨 Respuesta del servidor: ${JSON.stringify(err.response.data)}`, undefined, 'syncSales');
        }
      }
    }
  } catch (err: any) {
    logger.error(`❌ Error general al sincronizar ventas: ${err.message}`, undefined, 'syncSales');
  }
}
