import { PoolClient } from 'pg';
import axios from 'axios';
import { logger } from '../logger/logger.service'; // ✅ Importa la instancia global

export async function syncDeposits(client: PoolClient) {
    logger.log('Buscando depósitos nuevos para sincronizar', 'syncDeposits');

    const res = await client.query(`
        SELECT * FROM deposit WHERE sincronizado IS DISTINCT FROM TRUE
    `);

    for (const row of res.rows) {
        try {
            logger.debug(`🧾 Depósito a enviar: ${JSON.stringify(row)}`, 'syncDeposits');

            const body = {
                deposit_type: {
                    code_deposit_type: row.code_deposit_type,
                    movement_type: row.tipo_movimiento,
                    description: row.descripcion_tipo,
                    state: row.estado_tipo,
                },
                deposit: {
                    date_process: row.date_process,
                    id_cash_register: row.id_cash_register,
                    total_amount: row.total_amount,
                    deposit_number: row.deposit_number,
                    id_currency: row.id_currency,
                    state: row.state,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    code_deposit_type: row.code_deposit_type,
                }
            };

            await axios.post('http://localhost:3000/deposits', body);

            await client.query(
                'UPDATE deposit SET sincronizado = TRUE WHERE id_deposit = $1',
                [row.id_deposit]
            );

            logger.log(`Depósito ${row.deposit_number} sincronizado correctamente`, 'syncDeposits');
        } catch (err: any) {
            logger.error(`Error al enviar depósito ${row.deposit_number}: ${err.message}`, undefined, 'syncDeposits');
        }
    }
}
