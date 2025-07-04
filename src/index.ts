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
  const client = await pool.connect();

  try {
    await ensureMigrationColumns(client, 'public', TableName.SALE_NOTES, MIGRATION_COLUMNS_DOCUMENT);
    client.release();

    const runSync = async () => {
      try {
        logger.log('⏱ Ejecutando sincronización...');
        await sync(pool);
      } catch (err: any) {
        logger.error(`❌ Error general: ${err.message}`, err.stack, 'Sync');
      }
    };

    // Siempre usar cron, incluso en desarrollo
    const cronExpression = '*/30 * * * * *'; // cada 30 segundos

    let isRunning = false;

    const job = new CronJob(
      cronExpression,
      async () => {
        if (isRunning) {
          logger.warn('⚠️ Sincronización anterior aún en curso, se omite esta ejecución.', 'Cron');
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

    logger.log(`🗓 Job programado para cada 30 segundos (cron: ${cronExpression}) [Zona: America/Lima]`, 'Bootstrap');
  } catch (err: unknown) {
    client.release();
    if (err instanceof Error) {
      logger.error(`❌ Error al inicializar: ${err.message}`, err.stack, 'Bootstrap');
    } else {
      logger.error('❌ Error desconocido al inicializar', undefined, 'Bootstrap');
    }
  }
})();
