import { PoolClient } from 'pg';
import { MIGRATION_COLUMNS_DOCUMENT, MigrationColumnsDocument } from "../config/columns";

async function ensureMigrationColumns(
    conn: PoolClient,
    schema: string,
    tableName: string,
    columns: Record<string, string> = MIGRATION_COLUMNS_DOCUMENT
): Promise<void> {
    const stmts = Object.entries(columns).map(
        ([col, def]) =>
            `ALTER TABLE "${schema}"."${tableName}" ADD COLUMN IF NOT EXISTS "${col}" ${def}`
    );

    for (const sql of stmts) {
        await conn.query(sql);
    }
}

async function markMigrated(
    conn: PoolClient,
    schema: string,
    tableName: string,
    id: number,
    statusCode: string,
    type: 'migrated' | 'updated',
    migratedId?: string
): Promise<void> {
    const baseField = type === 'migrated'
        ? MigrationColumnsDocument.MIGRATED_AT
        : MigrationColumnsDocument.MIGRATED_UPDATED_AT;

    const assignments = [
        `"${MigrationColumnsDocument.FROM_SOURCE}" = true`,
        `"${baseField}" = NOW()`,
        `"${MigrationColumnsDocument.MIGRATED_STATUS_CODE}" = $1`
    ];
    const params: any[] = [statusCode];

    if (migratedId) {
        assignments.push(`"${MigrationColumnsDocument.MIGRATED_ID_DOCUMENT}" = $2`);
        params.push(migratedId);
    }

    const paramIndex = migratedId ? 3 : 2;
    const sql = `
        UPDATE "${schema}"."${tableName}"
           SET ${assignments.join(', ')}
         WHERE id = $${paramIndex}
    `;
    params.push(id);

    await conn.query(sql, params);
}

export {
    ensureMigrationColumns,
    markMigrated
};
