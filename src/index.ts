import { CronJob } from 'cron';

import { logger } from './utils/logger';
import { SYNC_INTERVAL_CRON } from './config/env';
import { syncAllTenants } from './services/sync.service';


let isRunning = false;

const job = new CronJob(
    SYNC_INTERVAL_CRON,
    async () => {
        if (isRunning) {
            logger.warn('Sincronización previa en curso, salto este ciclo');
            return;
        }
        isRunning = true;
        logger.info('Iniciando sincronización');
        try {
            await syncAllTenants();
            logger.info('Sincronización completada');
        } catch (e: any) {
            logger.error(`Error general: ${e.message}`);
        } finally {
            isRunning = false;
        }
    },
    null,
    true,
    'America/Lima'
);
job.start();

/* async function start() {
    logger.info('Iniciando sincronización');

    try {
        await syncAllTenants();
        logger.info('Sincronización completada');
    } catch (e: any) {
        logger.error(`Error general: ${e.message}`);
    }
}
start()
 */