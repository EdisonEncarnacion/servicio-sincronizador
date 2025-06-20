import mysql from 'mysql2/promise';
import { SaleNoteDocument } from "../../interfaces/database/sale-note.interface";
import { TableName } from "../../config/table-names";
import { SaleNoteInsert } from '../../interfaces/mappers/pending-to-sale-note.mapper';

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

export const insertSaleNote = async (
    db: mysql.Connection,
    payload: SaleNoteInsert,
): Promise<number> => {
    try {
        await db.beginTransaction();
        const columns = Object.keys(payload.note).join(',');
        const placeholders = Object.keys(payload.note).map(() => '?').join(',');
        const values = Object.values(payload.note);
        const sql = `INSERT INTO ${TableName.SALE_NOTES} (${columns}) VALUES (${placeholders})`;
        const [header] = await db.execute(sql, values) as [mysql.ResultSetHeader, any];
        const saleNoteId = header.insertId;
        if (payload.items.length) {
            const itemCols = `(sale_note_id, ${Object.keys(payload.items[0]).join(',')})`;
            const itemPlaceholders = payload.items
                .map(() => '(?' + ',?'.repeat(Object.keys(payload.items[0]).length) + ')')
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
