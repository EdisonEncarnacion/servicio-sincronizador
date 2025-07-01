// src/services/syncCashRegisters.ts
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
}

export async function syncCashRegisters(client: PoolClient) {
    logger.log('Buscando cajas nuevas para sincronizar');

    try {
        const { rows: cashRegisters } = await client.query<LocalCashRegister>(
            `SELECT * FROM cash_register WHERE migrated IS DISTINCT FROM true`
        );

        for (const register of cashRegisters) {
            try {
                logger.log(`Enviando caja: ${JSON.stringify(register)}`); // 👈 NUEVO

                const response = await axios.post('http://localhost:3000/cash-registers', {
                    id_cash_register: register.id_cash_register,
                    id_user: register.id_user,
                    id_state: register.id_state,
                    opennig_date: register.opennig_date,
                    last_closing_date: register.last_closing_date,
                    register_date: register.register_date,
                    id_local: register.id_local,
                    id_work_shift: register.id_work_shift,
                    id_serie: register.id_serie,
                });

                logger.log(`Caja ${register.id_cash_register} sincronizada correctamente`);


                await client.query(`UPDATE cash_register SET migrated = true WHERE id_cash_register = $1`, [
                    register.id_cash_register,
                ]);
            } catch (err: any) {
                logger.error(`❌ Error al sincronizar caja ${register.id_cash_register}: ${err.message}`);
            }
        }
    } catch (err: any) {
        logger.error(`❌ Error general en syncCashRegisters: ${err.message}`);
    }
}
