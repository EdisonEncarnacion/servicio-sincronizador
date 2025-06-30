export enum MigrationColumnsDocument {
    FROM_SOURCE = 'from_source',
    MIGRATED_AT = 'migrated_at',
    MIGRATED_STATUS_CODE = 'migrated_status_code',
    MIGRATED_UPDATED_AT = 'migrated_updated_at',
    MIGRATED_ID_DOCUMENT = 'migrated_id_document',
}

export const MIGRATION_COLUMNS_DOCUMENT: Record<string, string> = {
    [MigrationColumnsDocument.FROM_SOURCE]: 'BOOLEAN NOT NULL DEFAULT false',
    [MigrationColumnsDocument.MIGRATED_AT]: 'TIMESTAMP NULL',
    [MigrationColumnsDocument.MIGRATED_STATUS_CODE]: 'VARCHAR(10)',
    [MigrationColumnsDocument.MIGRATED_UPDATED_AT]: 'TIMESTAMP NULL',
    [MigrationColumnsDocument.MIGRATED_ID_DOCUMENT]: 'VARCHAR(255)',
};
