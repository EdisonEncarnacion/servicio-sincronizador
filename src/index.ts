import { createDatabaseConnection } from './config/db';
import { logger } from './logger';
import { config } from './config/env';
import { sync } from './services/sync.service';
import { ensureMigrationColumns } from './services/database-service';
import { TableName } from './config/table-names';
import { MIGRATION_COLUMNS_DOCUMENT } from './config/columns';

// 🧩 Configuración de locales
const localIdBackoffice = 'c5f7d4e6-3333-4444-5555-666677778811'; // UUID del local en backoffice
const localIdVentas = 1; // ID numérico del local en la base de datos de ventas

(async () => {
  const pool = await createDatabaseConnection();

  // Validar columnas una vez al inicio
  const client = await pool.connect();
  try {
    await ensureMigrationColumns(client, 'public', TableName.SALE_NOTES, MIGRATION_COLUMNS_DOCUMENT);
    logger.log('✅ Columnas de migración validadas');
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`❌ Error validando columnas de migración: ${err.message}`, err.stack, 'Bootstrap');
    } else {
      logger.error('❌ Error desconocido al validar columnas de migración', undefined, 'Bootstrap');
    }
  } finally {
    client.release();
  }

  // Ejecutar sincronización cada 30 segundos
  const runSync = async () => {
    try {
      logger.log('⏱ Ejecutando sincronización automática...');
      await sync(pool, {
        localIdBackoffice,
        localIdVentas,
      });
      logger.log('✅ Sincronización completada');
    } catch (err: any) {
      logger.error(`❌ Error al ejecutar sincronización: ${err.message}`, err.stack, 'Bootstrap');
    }
  };

  // Primera ejecución inmediata
  await runSync();

  // Luego cada 30 segundos
  setInterval(runSync, 30 * 1000);
})();
