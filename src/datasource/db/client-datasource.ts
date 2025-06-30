import { TableName } from "../../config/table-names";
import { PoolClient } from 'pg';
import { Person } from "../../interfaces/database/person.inteface";

const getClients = async (db: PoolClient): Promise<Person[]> => {
    const query = `
        SELECT
            c.id,
            c.name,
            c.number,
            c.email,
            c.telephone
        FROM ${TableName.CUSTOMERS} AS c
        ORDER BY c.created_at DESC;
    `;
    const result = await db.query(query);
    return result.rows;
};

const getClientByDocumentNumber = async (
    db: PoolClient,
    documentNumber: string
): Promise<Person | null> => {
    const query = `
        SELECT
            c.id,
            c.name,
            c.number,
            c.email,
            c.telephone
        FROM ${TableName.CUSTOMERS} AS c
        WHERE c.number = $1
    `;
    const result = await db.query(query, [documentNumber]);
    return result.rows[0] || null;
};

const saveClient = async (
    db: PoolClient,
    number: string,
    name: string | null,
    address: string | null,
): Promise<Person> => {
    const sql = `
        INSERT INTO ${TableName.CUSTOMERS} 
        (number, name, address, identity_document_type_id, country_id)
        VALUES ($1, $2, $3, 6, 'PE')
        RETURNING *;
    `;
    const result = await db.query(sql, [number, name, address]);
    return result.rows[0];
};

const upsertCustomerByDocument = async (
    db: PoolClient,
    number: string,
    name: string | null,
    address: string | null,
): Promise<Person> => {
    const found = await getClientByDocumentNumber(db, number);
    if (found) return found;

    await saveClient(db, number, name, address);
    const client = await getClientByDocumentNumber(db, number);

    if (!client) {
        throw new Error(`Cliente con número de documento ${number} no encontrado después de guardar.`);
    }

    return client;
};

export const CustomerDatasource = {
    getClients,
    saveClient,
    getClientByDocumentNumber,
    upsertCustomerByDocument
};
