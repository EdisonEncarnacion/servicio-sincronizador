import { PoolClient } from 'pg';
import { SaleNoteDocument } from '../../interfaces/database/sale-note.interface';
import { TableName } from '../../config/table-names';
import { SaleNoteInsert } from '../../interfaces/mappers/pending-to-sale-note.mapper';
import { MigrationColumnsDocument } from '../../config/columns';

export const getSaleNotes = async (db: PoolClient): Promise<SaleNoteDocument[]> => {
    const query = `
        SELECT
            sn.id,
            sn.series,
            sn.number,
            sni.unit_value
        FROM ${TableName.SALE_NOTES} AS sn
        INNER JOIN ${TableName.SALE_NOTES_ITEMS} AS sni ON sn.id = sni.sale_note_id
        ORDER BY sn.created_at DESC;
    `;
    const result = await db.query(query);
    return result.rows;
};

export const getSaleNotesWithDocument = async (
    db: PoolClient
): Promise<Array<{ id: number; external_id: string; state_type_id: string; document_number: string }>> => {
    const query = `
        SELECT
            sn.id,
            sn.external_id,
            d.state_type_id,
            CONCAT(d.series, '-', d.number) AS document_number
        FROM ${TableName.SALE_NOTES} sn
        JOIN ${TableName.DOCUMENTS} d ON d.id = sn.document_id
        WHERE sn.document_id IS NOT NULL
          AND sn.${MigrationColumnsDocument.FROM_SOURCE} = true
          AND sn.${MigrationColumnsDocument.MIGRATED_AT} IS NULL;
    `;
    const result = await db.query(query);
    return result.rows;
};

export const getNotesWithStateChange = async (
    db: PoolClient
): Promise<Array<{ id: number; external_id: string; new_state: string }>> => {
    const query = `
        SELECT sn.id,
               sn.external_id,
               d.state_type_id AS new_state
        FROM ${TableName.SALE_NOTES} sn
        JOIN ${TableName.DOCUMENTS} d ON d.id = sn.document_id
        WHERE sn.document_id IS NOT NULL
          AND sn.${MigrationColumnsDocument.FROM_SOURCE} = true
          AND sn.${MigrationColumnsDocument.MIGRATED_AT} IS NOT NULL
          AND sn.${MigrationColumnsDocument.MIGRATED_STATUS_CODE} <> d.state_type_id;
    `;
    const result = await db.query(query);
    return result.rows;
};

export const insertSaleNoteTx = async (
    db: PoolClient,
    payload: SaleNoteInsert
): Promise<number> => {
    const cols = Object.keys(payload.note);
    const colNames = [...cols, 'created_at', 'updated_at', MigrationColumnsDocument.FROM_SOURCE];
    const values = [...Object.values(payload.note), new Date(), new Date(), true];

    const placeholders = colNames.map((_, i) => `$${i + 1}`).join(',');

    const insertSql = `
        INSERT INTO ${TableName.SALE_NOTES} (${colNames.join(',')})
        VALUES (${placeholders})
        RETURNING id;
    `;

    const result = await db.query(insertSql, values);
    const saleNoteId = result.rows[0].id;

    if (payload.items.length > 0) {
        const itemCols = Object.keys(payload.items[0]);
        const itemInsertCols = ['sale_note_id', ...itemCols];
        const itemPlaceholders = payload.items
            .map((_, i) => {
                const baseIndex = i * (itemCols.length + 1);
                return `(${[...Array(itemCols.length + 1)].map((_, j) => `$${baseIndex + j + 1}`).join(',')})`;
            })
            .join(',');

        const itemValues = payload.items.flatMap(item => [saleNoteId, ...Object.values(item)]);

        const itemSql = `
            INSERT INTO ${TableName.SALE_NOTES_ITEMS} (${itemInsertCols.join(',')})
            VALUES ${itemPlaceholders};
        `;

        await db.query(itemSql, itemValues);
    }

    return saleNoteId;
};
