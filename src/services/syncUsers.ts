// src/services/syncUsers.ts

import axios from 'axios';
import { PoolClient } from 'pg';
import { logger } from '../logger/logger.service';

interface SyncContext {
  localIdBackoffice: string; // UUID desde backoffice
  localIdVentas: number;     // ID numérico de la BD local
}

export async function syncUsers(client: PoolClient, context: SyncContext) {
  const { localIdBackoffice, localIdVentas } = context;

  logger.log(`🔄 Sincronizando usuarios para local ${localIdBackoffice}`, 'syncUsers');

  try {
    const { data: users } = await axios.get('http://localhost:3000/sync/users', {
      params: { local_id: localIdBackoffice },
    });

    for (const user of users) {
      // ⚠ Validación por si 'id' es NULL
      if (!user.id) {
        logger.warn(`⚠ Usuario omitido por falta de id: ${JSON.stringify(user)}`, 'syncUsers');
        continue;
      }

      await client.query(
        `
        INSERT INTO "user" (id_user, username, password, card_number, id_local)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id_user) DO UPDATE SET
          username = EXCLUDED.username,
          password = EXCLUDED.password,
          card_number = EXCLUDED.card_number,
          id_local = EXCLUDED.id_local
        `,
        [
          user.id,
          user.username,
          user.password,
          user.card_number,
          localIdVentas,
        ],
      );
    }

    logger.log(`✅ Usuarios sincronizados correctamente para el local ${localIdBackoffice}`, 'syncUsers');
  } catch (error: any) {
    logger.error(`❌ Error al sincronizar usuarios: ${error.message}`, undefined, 'syncUsers');
    if (error.response) {
      logger.error(`📨 Respuesta del servidor: ${JSON.stringify(error.response.data)}`, undefined, 'syncUsers');
    }
  }
}
