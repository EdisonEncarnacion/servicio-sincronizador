import { CronJob } from 'cron';
import { createDatabaseConnection } from './config/db';
import { logger } from './logger';
import { config } from './config/env';
import { sync } from './services/sync.service';
import { ensureMigrationColumns } from './services/database-service';
import { TableName } from './config/table-names';
import { MIGRATION_COLUMNS_DOCUMENT } from './config/columns';

(async () => {
    const conn = await createDatabaseConnection();
    await ensureMigrationColumns(conn, config.DB_SYNC, TableName.SALE_NOTES, MIGRATION_COLUMNS_DOCUMENT);
    const runSync = async () => {
        try {
            logger.log('⏳ Iniciando sincronización', 'Sync');
            await sync(conn);
            logger.log('✅ Sincronización completada', 'Sync');
        } catch (err: any) {
            logger.error(`❌ Error general: ${err.message}`, err.stack, 'Sync');
        }
    };
    if (config.NODE_ENV === 'development') {
        logger.warn('Modo development');
        await runSync();
        process.exit(0);
    }
    if (config.NODE_ENV != 'development') {
        let isRunning = false;
        const job = new CronJob(
            config.SYNC_INTERVAL_CRON,
            async () => {
                if (isRunning) {
                    logger.warn('Sync anterior aún en curso, salto ciclo', 'Cron');
                    return;
                }
                isRunning = true;
                await runSync();
                isRunning = false;
            },
            null,
            true,
            'America/Lima',
        );

        logger.log(
            `Job programado (${config.SYNC_INTERVAL_CRON}) - zona America/Lima`,
            'Bootstrap',
        );
    }
})();
