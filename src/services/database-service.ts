import { RowDataPacket } from "mysql2";
import { createPrimaryConnection } from "../config/db";
import { MIGRATION_COLUMNS, MigrationColumns } from "../config/columns";
import { TenantInfo } from "../types/tenant.interface";
import { DB_PRINCIPAL_DATABASE } from "../config/env";

export async function listTenants(): Promise<string[]> {
    const conn = await createPrimaryConnection();
    const [rows] = await conn.query<RowDataPacket[]>(
        `
      SELECT schema_name AS SCHEMA_NAME
        FROM information_schema.schemata
       WHERE schema_name NOT IN (
         'information_schema','mysql','performance_schema','sys', ?
       )
         AND schema_name LIKE 'tenancy\\_%'
      `,
        [DB_PRINCIPAL_DATABASE]
    );
    await conn.end();
    return rows.map(r => r.SCHEMA_NAME as string);
}
export async function listTenantsData(): Promise<TenantInfo[]> {
    const schemas = await listTenants();
    const conn = await createPrimaryConnection();
    const result: TenantInfo[] = [];

    for (const schema of schemas) {
        const sql = `
        SELECT
          c.identity_document_type_id AS identityDocumentTypeId,
          c.number                    AS ruc,
          c.name                      AS name,
          c.trade_name                AS tradeName
        FROM \`${schema}\`.companies c
        LIMIT 1
      `;
        const [rows] = await conn.execute<
            (RowDataPacket & {
                identityDocumentTypeId: string;
                ruc: string;
                name: string;
                tradeName: string | null;
            })[]
        >(sql);

        const row = rows[0];
        result.push({
            schemaName: schema,
            // identityDocumentTypeId: row?.identityDocumentTypeId ?? null,
            ruc: row?.ruc ?? null,
            name: row?.name ?? null,
            tradeName: row?.tradeName ?? null,
        });
    }
    await conn.end();
    return result;
}
async function ensureMigrationColumns(
    conn: any,
    schema: string,
    tableName: string
): Promise<void> {
    const table = `\`${schema}\`.\`${tableName}\``;
    const stmts = Object.entries(MIGRATION_COLUMNS).map(
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
        migratedFile: boolean,
        migratedId?: string
    ): Promise<void> {
    const baseField = type === 'migrated'
        ? MigrationColumns.MIGRATED_AT
        : MigrationColumns.MIGRATED_UPDATED_AT;

    const assignments = [
        `\`${MigrationColumns.MIGRATED}\` = 1`,
        `\`${baseField}\` = NOW()`,
        `\`${MigrationColumns.MIGRATED_STATUS_CODE}\` = ?`
    ];
    const params: any[] = [statusCode];

    if (migratedId) {
        assignments.push(`\`${MigrationColumns.MIGRATED_ID_DOCUMENT}\` = ?`);
        params.push(migratedId);
    }
    if (migratedFile) {
        assignments.push(`\`${MigrationColumns.MIGRATED_FILE}\` = 1`);
    }

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