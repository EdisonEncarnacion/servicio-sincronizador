import { TableName } from '../../config/table-names';
import { PoolClient } from 'pg';
import { Document } from '../../interfaces/database/document.interface';

const getDocuments = async (db: PoolClient): Promise<Document[]> => {
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
  const result = await db.query(query);
  return result.rows;
};

const getDocumentById = async (
  db: PoolClient,
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
        WHERE s.id = $1;
    `;
  const result = await db.query(query, [documentId]);
  return result.rows[0] || null;
};

const getDocumentByFilename = async (
  db: PoolClient,
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
        WHERE s.filename = $1;
    `;
  const result = await db.query(query, [filename]);
  return result.rows[0] || null;
};

export const DocumentDatasource = {
  getDocuments,
  getDocumentById,
  getDocumentByFilename,
};
