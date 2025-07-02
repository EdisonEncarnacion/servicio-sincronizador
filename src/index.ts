import { CronJob } from 'cron';
import { createDatabaseConnection } from './config/db';
import { logger } from './logger';
import { config } from './config/env';
import { sync } from './services/sync.service';
import { ensureMigrationColumns } from './services/database-service';
import { TableName } from './config/table-names';
import { MIGRATION_COLUMNS_DOCUMENT } from './config/columns';

(async () => {
    const pool = await createDatabaseConnection();
    const client = await pool.connect(); // 👈 obtener PoolClient

    try {
        await ensureMigrationColumns(client, 'public', TableName.SALE_NOTES, MIGRATION_COLUMNS_DOCUMENT);
        client.release(); // 👈 libéralo aquí

        const runSync = async () => {
            try {

                await sync(pool); // 👈 aquí sí puedes pasar el pool completo si lo usa así internamente

            } catch (err: any) {
                logger.error(`❌ Error general: ${err.message}`, err.stack, 'Sync');
            }
        };

        if (config.NODE_ENV === 'development') {
            await runSync();
            process.exit(0);
        }
        

        if (config.NODE_ENV !== 'development') {
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

    } catch (err: unknown) {
        client.release(); // 👈 libéralo también en error
        if (err instanceof Error) {
            logger.error(`❌ Error al inicializar: ${err.message}`, err.stack, 'Bootstrap');
        } else {
            logger.error('❌ Error desconocido al inicializar', undefined, 'Bootstrap');
        }
    }

})();
