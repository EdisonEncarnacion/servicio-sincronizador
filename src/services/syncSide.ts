// src/services/syncSide.ts
import axios from 'axios';
import { PoolClient } from 'pg';
import { logger } from '../logger/logger.service';

interface SyncContext {
  localIdBackoffice: string;
  localIdVentas: number;
}

export async function syncSide(client: PoolClient, context: SyncContext) {
  const { localIdBackoffice, localIdVentas } = context;

  logger.log(`🔄 Sincronizando lados para local ${localIdBackoffice}`, 'syncSide');

  try {
    const { data: sides } = await axios.get('http://localhost:3000/sync/side', {
        params: { local_id: localIdBackoffice },
      });
      
      // 🔍 Diagnóstico: Verificar columnas disponibles en la tabla `side`
      const test = await client.query('SELECT * FROM side LIMIT 1');
      console.log('🧪 Columnas disponibles en tabla "side":', Object.keys(test.rows[0]));
      
    for (const side of sides) {
        await client.query(
            `
            INSERT INTO side (id_side, name, id_product, state, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id_side) DO UPDATE SET
              name = EXCLUDED.name,
              id_product = EXCLUDED.id_product,
              state = EXCLUDED.state,
              updated_at = EXCLUDED.updated_at
            `,
            [
              side.id,           // id_side
              side.name,
              side.product_id,   // viene con ese nombre del backend, pero se guarda como id_product
              side.state,
              side.created_at || new Date(), // se guarda como updated_at
            ],
          );
          
          
    }

    logger.log(`✅ Lados sincronizados correctamente para el local ${localIdBackoffice}`, 'syncSide');
  } catch (error: any) {
    logger.error(`❌ Error al sincronizar lados: ${error.message}`, undefined, 'syncSide');
    if (error.response) {
      logger.error(`📨 Respuesta del servidor: ${JSON.stringify(error.response.data)}`, undefined, 'syncSide');
    }
  }
}
