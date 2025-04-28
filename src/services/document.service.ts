import { RowDataPacket } from 'mysql2';
import { DocRow } from '../types/document';
import { logger } from '../utils/logger';

export async function fetchNewDocuments(
    conn: any,
    schema: string
): Promise<DocRow[]> {
    const sql = `SELECT * FROM \`${schema}\`.documents WHERE migrated = 0`;
    const [rows] = (await conn.execute(sql)) as [RowDataPacket[], any];
    return rows as DocRow[];
}

export async function fetchUpdatedDocuments(
    conn: any,
    schema: string
): Promise<DocRow[]> {
    const sql = `
    SELECT * FROM \`${schema}\`.documents
    WHERE migrated = 1
      AND updated_at > migrated_updated_at
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
