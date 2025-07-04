import { PoolClient } from 'pg';
import axios from 'axios';
import { logger } from '../logger';

interface LocalCashRegister {
  id_cash_register: number;
  id_user: number;
  id_state: number;
  opennig_date: Date;
  last_closing_date: Date;
  register_date: Date;
  id_local: number;
  id_work_shift: number;
  id_serie: number;
  migrated?: boolean;
  needs_update?: boolean;
}

export async function syncCashRegisters(client: PoolClient) {
  logger.log('Buscando cajas nuevas o actualizadas para sincronizar');

  try {
    const { rows: cashRegisters } = await client.query<LocalCashRegister>(`
      SELECT * FROM cash_register 
      WHERE migrated IS DISTINCT FROM true 
         OR needs_update IS TRUE
    `);

    if (cashRegisters.length === 0) {
      logger.log('No se encontraron cajas pendientes por sincronizar');
      return;
    }

    for (const register of cashRegisters) {
      const payload = {
        id_cash_register: register.id_cash_register,
        id_user: register.id_user,
        id_state: register.id_state,
        opennig_date: register.opennig_date,
        last_closing_date: register.last_closing_date,
        register_date: register.register_date,
        id_local: register.id_local,
        id_work_shift: register.id_work_shift,
        id_serie: register.id_serie,
      };

      try {
        logger.log(`Enviando caja con ID ${register.id_cash_register} al servidor`);

        logger.log(`📤 Payload enviado:\n${JSON.stringify(payload, null, 2)}`);

        await axios.post('http://localhost:3000/cash-registers', payload);

        logger.log(`Caja ${register.id_cash_register} registrada correctamente`);
      } catch (err: any) {
        const status = err.response?.status;

        if (status === 400 || status === 409) {
          logger.warn(`Caja ${register.id_cash_register} ya existe. Se intentará actualizar estado`);

          try {
            await axios.patch(`http://localhost:3000/cash-registers/${register.id_cash_register}`, {
              id_state: register.id_state,
            });

            logger.log(`Caja ${register.id_cash_register} actualizada correctamente (estado cambiado)`);

          } catch (patchErr: any) {
            logger.error(`❌ Error al hacer PATCH para la caja ${register.id_cash_register}: ${patchErr.message}`);
            continue; 
          }
        } else {
          logger.error(`❌ Error al hacer POST para la caja ${register.id_cash_register}: ${err.message}`);
          if (err.response) {
            logger.error(`Respuesta del servidor: ${JSON.stringify(err.response.data)}`);
          }
          continue; 
        }
      }

      await client.query(
        `UPDATE cash_register 
         SET migrated = true, needs_update = false 
         WHERE id_cash_register = $1`,
        [register.id_cash_register]
      );
    }

  } catch (err: any) {
    logger.error(`Error general en la sincronización de cajas: ${err.message}`);
  }
}
