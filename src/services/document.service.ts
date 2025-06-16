import { RowDataPacket } from 'mysql2';
import { DocRow } from '../types/document.interface';
import { logger } from '../utils/logger';
import { MigrationColumnsDocumentCanchas } from '../config/columns';
import { TableName } from '../config/table-names';

export type DocRowCustom = DocRow & { descripcionEstablecimiento: string };
export async function fetchNewDocuments(
    conn: any,
    schema: string
): Promise<DocRowCustom[]> {
    const sql = `
    SELECT
      d.*,
      e.description AS descripcionEstablecimiento
    FROM \`${schema}\`.${TableName.DOCUMENTS} AS d
    JOIN \`${schema}\`.establishments AS e
      ON d.establishment_id = e.id
    WHERE d.${MigrationColumnsDocumentCanchas.MIGRATED} = 0
  `;
    const [rows] = (await conn.execute(sql)) as [RowDataPacket[], any];
    const rowsFormatted = rows.map((row: any) => {
        row.customer = JSON.parse(row.customer);
        return row as DocRowCustom;
    });
    return rowsFormatted;
}

export async function fetchUpdatedDocuments(
    conn: any,
    schema: string
): Promise<DocRow[]> {
    const sql = `
      SELECT *
      FROM \`${schema}\`.${TableName.DOCUMENTS}
      WHERE ${MigrationColumnsDocumentCanchas.MIGRATED} = 1
        AND (
          updated_at > ${MigrationColumnsDocumentCanchas.MIGRATED_UPDATED_AT}
          OR state_type_id <> ${MigrationColumnsDocumentCanchas.MIGRATED_STATUS_CODE}
        )
    `;
    const [rows] = (await conn.execute(sql)) as [RowDataPacket[], any];
    return rows as DocRow[];
}
export function logStateChange(doc: DocRow, schema: string) {
    if (!doc.soap_shipping_response) return;
    try {
        const resp = JSON.parse(doc.soap_shipping_response);
        logger.info(
            `Tenant ${schema}: doc ${doc.external_id} estado SOAP -> code=${resp.code} desc="${resp.description}"`
        );
    } catch {
        logger.warn(
            `Tenant ${schema}: no pude parsear soap_shipping_response para ${doc.external_id}`
        );
    }
}
