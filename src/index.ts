import { CronJob } from 'cron';
import { logger } from './utils/logger';
import { syncAllTenants } from './services/sync.service';
import { config } from './config/env';

let isRunning = false;

const job = new CronJob(
    config.SYNC_INTERVAL_CRON,
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
console.log(`iniciando en modo: ${config.NODE_ENV}`)

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