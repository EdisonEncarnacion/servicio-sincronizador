import { PoolClient } from 'pg';
import axios from 'axios';
import { logger } from '../logger/logger.service';

export async function syncDeposits(client: PoolClient) {
  logger.log('Buscando depósitos nuevos para sincronizar', 'syncDeposits');

  const res = await client.query(`
    SELECT * FROM deposit WHERE sincronizado IS DISTINCT FROM TRUE
  `);
  for (const row of res.rows) {
    const body = {
      date_process: row.date_process,
      id_cash_register: Number(row.id_cash_register),
      total_amount: Number(row.total_amount),
      deposit_number: row.deposit_number,
      id_currency: Number(row.id_currency),
      state: Number(row.state),
      created_at: row.created_at,
      updated_at: row.updated_at,
      code_deposit_type: row.code_deposit_type,
    };
  
    try {
      logger.debug(`Depósito a enviar: ${JSON.stringify(row)}`, 'syncDeposits');
  
      await axios.post('http://localhost:3000/deposits', body);
  
      await client.query(
        'UPDATE deposit SET sincronizado = TRUE WHERE id_deposit = $1',
        [row.id_deposit]
      );
  
      logger.log(`Depósito ${row.deposit_number} sincronizado correctamente`, 'syncDeposits');
    } catch (err: any) {
      logger.error(`Error al enviar depósito ${row.deposit_number}: ${err.message}`, undefined, 'syncDeposits');
  
      if (err.response) {
        logger.error(
          `Respuesta del servidor: ${JSON.stringify(err.response.data)}`,
          undefined,
          'syncDeposits'
        );
        logger.error(
          `Payload enviado: ${JSON.stringify(body)}`,
          undefined,
          'syncDeposits'
        );
      }
    }
  }
}