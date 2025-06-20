import { TableName } from '../../config/table-names';
import mysql from 'mysql2/promise';

const getDocuments = async (db: mysql.Connection): Promise<Document[]> => {
    const query = `
    SELECT
      s.id,
      s.external_id,
      s.series,
      s.number,
      s.date_of_issue,
      s.customer_id,
      s.total,
      s.state_type_id,
      s.migrated,
      s.created_at
    FROM ${TableName.DOCUMENTS} AS s
    ORDER BY s.created_at DESC;
  `;
    const [rows] = (await db.execute(query) as unknown) as [Document[], any];
    return rows;
};
const getDocumentById = async (
    db: mysql.Connection,
    documentId: number
): Promise<Document | null> => {
    const query = `
    SELECT
      s.id,
      s.external_id,
      s.series,
      s.number,
      s.date_of_issue,
      s.customer_id,
      s.total,
      s.state_type_id,
      s.migrated,
      s.created_at
    FROM ${TableName.DOCUMENTS} AS s
    WHERE s.id = ?;
  `;
    const [rows] = (await db.execute(query, [documentId]) as unknown) as [Document[], any];
    return rows[0] || null;
};
const getDocumentByFilename = async (
    db: mysql.Connection,
    filename: string
): Promise<Document | null> => {
    const query = `
    SELECT
      s.id,
      s.external_id,
      s.series,
      s.number,
      s.date_of_issue,
      s.customer_id,
      s.total,
      s.state_type_id,
      s.migrated,
      s.created_at
    FROM ${TableName.DOCUMENTS} AS s
    WHERE s.filename = ?;
  `;
    const [rows] = (await db.execute(query, [filename]) as unknown) as [Document[], any];
    return rows[0] || null;
};
export const DocumentDatasource = {
    getDocuments,
    getDocumentById,
    getDocumentByFilename,
};
