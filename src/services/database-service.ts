import { RowDataPacket } from "mysql2";
import { DB_PRINCIPAL_DATABASE } from "../config";
import { createPrimaryConnection } from "../config/db";
import { MIGRATION_COLUMNS } from "../config/columns";

async function listTenants(): Promise<string[]> {
    const conn = await createPrimaryConnection();
    const [rows] = (await conn.query(
        `SELECT schema_name AS SCHEMA_NAME
       FROM information_schema.schemata
      WHERE schema_name NOT IN (
        'information_schema','mysql','performance_schema','sys',?
      )
        AND schema_name LIKE 'tenancy_%'`,
        [DB_PRINCIPAL_DATABASE]
    )) as [RowDataPacket[], any];
    await conn.end();
    return rows.map(r => r.SCHEMA_NAME as string);
}

async function ensureMigrationColumns(
    conn: any,
    schema: string
): Promise<void> {
    const table = `\`${schema}\`.documents`;
    const stmts = Object.entries(MIGRATION_COLUMNS).map(
        ([col, def]) => `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${def}`
    );
    await Promise.all(stmts.map(sql => conn.execute(sql)));
}

async function markMigrated(
    conn: any,
    schema: string,
    id: number
): Promise<void> {
    const sql = `
    UPDATE \`${schema}\`.documents
    SET migrated = 1,
        migrated_at = COALESCE(migrated_at, NOW()),
        migrated_updated_at = NOW()
    WHERE id = ?
  `;
    await conn.execute(sql, [id]);
}

export {
    listTenants,
    ensureMigrationColumns,
    markMigrated
}