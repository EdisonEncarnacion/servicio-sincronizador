
export enum MigrationColumns {
    MIGRATED = 'migrated',
    MIGRATED_FILE = 'migrated_file',
    MIGRATED_AT = 'migrated_at',
    MIGRATED_UPDATED_AT = 'migrated_updated_at',
    MIGRATED_STATUS_CODE = 'migrated_status_code',
    MIGRATED_ID_DOCUMENT = 'migrated_document_id',
}
export const MIGRATION_COLUMNS: Record<string, string> = {
    [MigrationColumns.MIGRATED]: 'TINYINT(1) NOT NULL DEFAULT 0',
    [MigrationColumns.MIGRATED_FILE]: 'TINYINT(1) NOT NULL DEFAULT 0',
    [MigrationColumns.MIGRATED_AT]: 'DATETIME NULL',
    [MigrationColumns.MIGRATED_UPDATED_AT]: 'DATETIME NULL',
    [MigrationColumns.MIGRATED_STATUS_CODE]: 'VARCHAR(255) NULL',
    [MigrationColumns.MIGRATED_ID_DOCUMENT]: 'VARCHAR(255) NULL',
};
