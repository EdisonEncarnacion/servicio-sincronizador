import { Pool } from 'pg';
// import { syncSalesAndDetails } from './sale-sync.service';
// import { syncClients } from './syncClients';
import { syncCashRegisters } from './syncCashRegisters';
import { syncDeposits } from './syncDeposits'; 
import { LoggerService } from '../logger/logger.service';

const logger = new LoggerService();

export async function sync(pool: Pool) {
    const client = await pool.connect();
    try {
        logger.log('Iniciando sincronización');


        // await syncSalesAndDetails(client);
        // await syncClients(client);

        await syncCashRegisters(client);  
        await syncDeposits(client);     

        logger.log('Sincronización completada');
    } catch (prepErr: any) {
        logger.error(`Error general en sync: ${prepErr.message}`);
    } finally {
        client.release();
    }
}
