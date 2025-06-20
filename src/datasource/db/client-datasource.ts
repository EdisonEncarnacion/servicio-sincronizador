import { TableName } from "../../config/table-names";
import mysql from 'mysql2/promise';
import { Person } from "../../interfaces/database/person.inteface";



const getClients = async (db: mysql.Connection) => {
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
    const [rows] = (await db.execute(query) as unknown) as [Person[], any];
    return rows;
}
const getClientByDocumentNumber = async (db: mysql.Connection, documentNumber: string): Promise<Person | null> => {
    const query = `
        SELECT
            c.id,
            c.name,
            c.number,
            c.email,
            c.telephone
        FROM ${TableName.CUSTOMERS} AS c
        WHERE c.number = ?
    `;
    const [rows] = (await db.execute(query, [documentNumber]) as unknown) as [Person[], any];
    return rows[0] || null;
}
 const upsertCustomerByDocument = async (
    db: mysql.Connection,
    number: string,
    name: string | null,
    address: string | null,
): Promise<number> => {
    const found = await getClientByDocumentNumber(db, number);
    if (found) return found.id;
    return await saveClient(db, number, name, address);  
};

export const saveClient = async (
    db: mysql.Connection,
    number: string,
    name: string | null,
    address: string | null,
): Promise<number> => {
    const sql = `
    INSERT INTO ${TableName.CUSTOMERS} (number, name, address, created_at)
    VALUES (?, ?, ?, NOW());
  `;
    const [r] = await db.execute<mysql.ResultSetHeader>(sql, [number, name, address]);
    return r.insertId;
};

export const CustomerDatasource = {
    getClients,
    saveClient,
    getClientByDocumentNumber,
    upsertCustomerByDocument
}