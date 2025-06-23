import mysql from 'mysql2/promise';
import { MIGRATION_COLUMNS_DOCUMENT, MigrationColumnsDocumentCanchas } from "../config/columns";

async function ensureMigrationColumns(
    conn: mysql.Connection,
    schema: string,
    tableName: string,
    columns: Record<string, string> = MIGRATION_COLUMNS_DOCUMENT
): Promise<void> {
    const table = `\`${schema}\`.\`${tableName}\``;
    const stmts = Object.entries(columns).map(
        ([col, def]) => `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS \`${col}\` ${def}`
    );
    await Promise.all(stmts.map(sql => conn.execute(sql)));
}
async function markMigrated
    (
        conn: any,
        schema: string,
        tableName: string,
        id: number,
        statusCode: string,
        type: 'migrated' | 'updated',
        migratedId?: string
    ): Promise<void> {
    const baseField = type === 'migrated'
        ? MigrationColumnsDocumentCanchas.MIGRATED_AT
        : MigrationColumnsDocumentCanchas.MIGRATED_UPDATED_AT;

    const assignments = [
        `\`${MigrationColumnsDocumentCanchas.FROM_CANCHAS}\` = 1`,
        `\`${baseField}\` = NOW()`,
        `\`${MigrationColumnsDocumentCanchas.MIGRATED_STATUS_CODE}\` = ?`
    ];
    const params: any[] = [statusCode];

    if (migratedId) {
        assignments.push(`\`${MigrationColumnsDocumentCanchas.MIGRATED_ID_DOCUMENT}\` = ?`);
        params.push(migratedId);
    }
    /*    if (migratedFile) {
           assignments.push(`\`${MigrationColumnsDocumentCanchas.MIGRATED_FILE}\` = 1`);
       } */

    const sql = `
      UPDATE \`${schema}\`.\`${tableName}\`
         SET ${assignments.join(', ')}
       WHERE id = ?
    `;
    params.push(id);
    await conn.execute(sql, params);
}
export {
    ensureMigrationColumns,
    markMigrated
}