export const MIGRATION_COLUMNS: Record<string, string> = {
    migrated: 'TINYINT(1) NOT NULL DEFAULT 0',
    migrated_at: 'DATETIME NULL',
    migrated_updated_at: 'DATETIME NULL',
};