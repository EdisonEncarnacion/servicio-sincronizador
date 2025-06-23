export enum MigrationColumnsDocumentCanchas {
    FROM_CANCHAS = 'from_canchas',
    MIGRATED_AT = 'migrated_canchas_at',
    MIGRATED_STATUS_CODE = 'migrated_canchas_status_code',
    MIGRATED_UPDATED_AT = 'migrated_canchas_updated_at',
    MIGRATED_ID_DOCUMENT = 'migrated_canchas_id_document',
}
export const MIGRATION_COLUMNS_DOCUMENT: Record<string, string> = {
    [MigrationColumnsDocumentCanchas.FROM_CANCHAS]: 'TINYINT(1) NOT NULL DEFAULT 0',
    [MigrationColumnsDocumentCanchas.MIGRATED_AT]: 'DATETIME NULL',
    [MigrationColumnsDocumentCanchas.MIGRATED_STATUS_CODE]: 'VARCHAR(10) NULL',
    [MigrationColumnsDocumentCanchas.MIGRATED_UPDATED_AT]: 'DATETIME NULL',
    [MigrationColumnsDocumentCanchas.MIGRATED_ID_DOCUMENT]: 'VARCHAR(255) NULL',
};
