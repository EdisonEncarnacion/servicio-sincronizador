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
): Promise<Array<{
    id: number, external_id: string;
    state_type_id: string,
    document_number: string
}>> => {
    const sql = `
    SELECT
      sn.id,
      sn.external_id, 
      d.state_type_id,
     -- UUID de la reserva
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
export const getNotesWithStateChange = async (
    db: mysql.Connection,
): Promise<
    Array<{ id: number; external_id: string; new_state: string }>
> => {
    const sql = `
    SELECT sn.id,
           sn.external_id,
           d.state_type_id        AS new_state
    FROM   ${TableName.SALE_NOTES} sn
    JOIN   ${TableName.DOCUMENTS}  d ON d.id = sn.document_id
    WHERE  sn.document_id IS NOT NULL
      AND  sn.${MigrationColumnsDocumentCanchas.FROM_CANCHAS} = 1
      AND  sn.${MigrationColumnsDocumentCanchas.MIGRATED_AT}      IS NOT NULL
      AND  sn.${MigrationColumnsDocumentCanchas.MIGRATED_STATUS_CODE} <> d.state_type_id;
  `; 
    const [rows] = await db.execute(sql) as [any[], any];
    return rows; 
};
export const insertSaleNoteTx = async (
    db: mysql.Connection,
    payload: SaleNoteInsert,
): Promise<number> => {

    const cols = Object.keys(payload.note).join(',') +
        `,created_at,updated_at,${MigrationColumnsDocumentCanchas.FROM_CANCHAS}`;
    const ph = Object.keys(payload.note).map(() => '?').join(',') + ',NOW(),NOW(),TRUE';
    const vals = Object.values(payload.note);

    const sql = `INSERT INTO ${TableName.SALE_NOTES} (${cols}) VALUES (${ph})`;
    const [hdr] = await db.execute(sql, vals) as [mysql.ResultSetHeader, any];
    const saleNoteId = hdr.insertId;

    if (payload.items.length) {
        const itemCols = `(sale_note_id,${Object.keys(payload.items[0]).join(',')})`;
        const itemPh = payload.items
            .map(() => `(?,${Object.keys(payload.items[0]).map(() => '?').join(',')})`)
            .join(',');
        const itemVals = payload.items.flatMap(i => [saleNoteId, ...Object.values(i)]);

        const itemSql = `INSERT INTO ${TableName.SALE_NOTES_ITEMS} ${itemCols} VALUES ${itemPh}`;
        await db.execute(itemSql, itemVals);
    }

    return saleNoteId;
};
