import { TableName } from "../../config/table-names";
import mysql from 'mysql2/promise';
import { Person } from "../../interfaces/database/person.inteface";
import { Customer } from "../../interfaces/database/sale-note.interface";



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

export const saveClient = async (
    db: mysql.Connection,
    number: string,
    name: string | null,
    address: string | null,
): Promise<Person> => {
    const sql = `
    INSERT INTO ${TableName.CUSTOMERS} (number, name, address,identity_document_type_id,country_id)
    VALUES (?, ?, ?, 1,'PE');
  `;
    const [r] = await db.execute<mysql.ResultSetHeader>(sql, [number, name, address]);
    return r as unknown as Person;
};

export const CustomerDatasource = {
    getClients,
    saveClient,
    getClientByDocumentNumber,
    upsertCustomerByDocument
}