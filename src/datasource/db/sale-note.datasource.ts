import mysql from 'mysql2/promise';
import { SaleNoteDocument } from "../../interfaces/database/sale-note.interface";
import { TableName } from "../../config/table-names";
import { SaleNoteInsert } from '../../interfaces/mappers/pending-to-sale-note.mapper';
import { MigrationColumnsDocumentCanchas } from '../../config/columns';

export const getSaleNotes = async (db: mysql.Connection) => {
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
    const [rows] = (await db.execute(query) as unknown) as [SaleNoteDocument[], any];
    return rows;
}

export const getSaleNotesWithDocument = async (
    db: mysql.Connection,
): Promise<Array<{ id: number, external_id: string; document_number: string }>> => {
    const sql = `
    SELECT
      sn.id,
      sn.external_id,                                  -- UUID de la reserva
      CONCAT(d.series, '-', d.number) AS document_number
    FROM   ${TableName.SALE_NOTES} sn
    JOIN   ${TableName.DOCUMENTS}  d ON d.id = sn.document_id
    WHERE  sn.document_id IS NOT NULL
      AND  sn.${MigrationColumnsDocumentCanchas.FROM_CANCHAS} = 1
      AND sn.${MigrationColumnsDocumentCanchas.MIGRATED_AT} IS NULL
  `;

    const [rows] = await db.execute(sql) as [any[], any];
    return rows;
};
export const insertSaleNote = async (
    db: mysql.Connection,
    payload: SaleNoteInsert,
): Promise<number> => {
    try {

        await db.beginTransaction();
        const columns = Object.keys(payload.note).join(',') + `,created_at,updated_at,${MigrationColumnsDocumentCanchas.FROM_CANCHAS}`;
        const placeholders = Object.keys(payload.note).map(() => '?').join(',') + ',NOW(),NOW(),TRUE';
        const values = Object.values(payload.note);
        const sql = `INSERT INTO ${TableName.SALE_NOTES} (${columns}) VALUES (${placeholders})`;
        const [header] = await db.execute(sql, values) as [mysql.ResultSetHeader, any];
        const saleNoteId = header.insertId;

        if (payload.items.length) {
            const itemCols = `(sale_note_id,${Object.keys(payload.items[0]).join(',')})`;
            const itemPlaceholders = payload.items
                .map(() => `(?,${Object.keys(payload.items[0]).map(() => '?').join(',')})`)
                .join(',');
            const itemValues = payload.items.flatMap(i => [saleNoteId, ...Object.values(i)]);

            const itemSql = `INSERT INTO ${TableName.SALE_NOTES_ITEMS} ${itemCols} VALUES ${itemPlaceholders}`;
            await db.execute(itemSql, itemValues);
        }
        await db.commit();

        return saleNoteId;
    } catch (e) {
        await db.rollback();
        throw e;
    }
};
