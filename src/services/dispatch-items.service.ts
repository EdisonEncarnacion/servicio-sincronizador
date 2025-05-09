import { RowDataPacket } from 'mysql2';

export interface DispatchItemRow extends RowDataPacket {
    id: number;
    dispatch_id: number;
    item_id: number;
    item: string;
    quantity: number;
}

export async function fetchDispatchItems(
    conn: any,
    schema: string,
    dispatchId: number
): Promise<DispatchItemRow[]> {
    const sql = `
    SELECT *
      FROM \`${schema}\`.dispatch_items
     WHERE dispatch_id = ?
  `;
    const [rows] = await conn.execute(sql, [dispatchId]);
    return rows as DispatchItemRow[];
}
