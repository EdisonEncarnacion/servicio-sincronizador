import { Pool } from 'pg';
import { syncCashRegisters } from './syncCashRegisters';
import { syncDeposits } from './syncDeposits'; 
import { syncSales } from './syncSales';
import { syncUsers } from './syncUsers'; // 👈 agrega esto si aún no lo tienes
import { LoggerService } from '../logger/logger.service';

const logger = new LoggerService();

interface SyncContext {
  localIdBackoffice: string;
  localIdVentas: number;
}

export async function sync(pool: Pool, context: SyncContext) {
  const client = await pool.connect();
  try {
    logger.log('Iniciando sincronización');

    await syncCashRegisters(client);  
    await syncDeposits(client);     
    await syncSales(client); 
    await syncUsers(client, context); // 👈 aquí pasas los IDs para sincronizar usuarios

    logger.log('Sincronización completada');
  } catch (prepErr: any) {
    logger.error(`Error general en sync: ${prepErr.message}`);
  } finally {
    client.release();
  }
}
