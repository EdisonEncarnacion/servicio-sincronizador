import { CronJob } from 'cron';

import { logger } from './utils/logger';
import { SYNC_INTERVAL_CRON } from './config/env';
import { syncAllTenants } from './services/sync.service';

/* const job = new CronJob(SYNC_INTERVAL_CRON, async () => {
    logger.info('Iniciando sincronización'); */
async function start() {
    logger.info('Iniciando sincronización');

    try {
        await syncAllTenants();
        logger.info('Sincronización completada');
    } catch (e: any) {
        logger.error(`Error general: ${e.message}`);
    }
}
/* }); */
start()
