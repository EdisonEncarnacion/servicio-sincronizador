import { RowDataPacket } from 'mysql2';
import { MigrationColumnsDocumentCanchas } from '../config/columns';
import { DispatchRow } from '../types/dispatch.interface';
import { TableName } from '../config/table-names';

export type DispatchRowCustom = DispatchRow & { descripcionEstablecimiento: string };
export async function fetchNewDispatches(
  conn: any,
  schema: string
): Promise<DispatchRowCustom[]> {
  const sql = `
    SELECT
      d.*,
      e.description AS descripcionEstablecimiento
    FROM \`${schema}\`.${TableName.DISPATCHES} AS d
    JOIN \`${schema}\`.establishments AS e
      ON d.establishment_id = e.id
    WHERE d.${MigrationColumnsDocumentCanchas.MIGRATED} = 0
  `;
  const [rows] = await conn.execute(sql);
  const rowsFormatted = rows.map((row: any) => {
    row.customer = JSON.parse(row.customer);
    return row;
  });
  return rowsFormatted as DispatchRowCustom[];
}
export async function fetchUpdatedDispatches(
  conn: any,
  schema: string
): Promise<DispatchRow[]> {
  const sql = `
    SELECT *
      FROM \`${schema}\`.${TableName.DISPATCHES}
     WHERE ${MigrationColumnsDocumentCanchas.MIGRATED} = 1
       AND (
         updated_at > ${MigrationColumnsDocumentCanchas.MIGRATED_UPDATED_AT}
         OR state_type_id <> ${MigrationColumnsDocumentCanchas.MIGRATED_STATUS_CODE}
       )
  `;
  const [rows] = await conn.execute(sql);
  return rows as DispatchRow[];
}
