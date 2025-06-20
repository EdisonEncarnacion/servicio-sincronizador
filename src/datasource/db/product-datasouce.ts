import mysql from 'mysql2/promise';
import { Product } from "../../interfaces/database/product.interface";
import { TableName } from "../../config/table-names";
const getProducts = async (db: mysql.Connection) => {
    const query = `
        SELECT
            p.id,
            p.name,
            p.description,
            p.internal_id,
            p.sale_unit_price,
            p.stock
        FROM ${TableName.PRODUCTS} AS p
        ORDER BY p.created_at DESC;
    `;
    const [rows] = (await db.execute(query) as unknown) as [Product[], any];
    return rows;
}
const upsertProductCampo = async (
    db: mysql.Connection,
    code: string,
    name: string,
    price: number,
): Promise<number> => {
    const found = await getProductByCode(db, code);
    if (found) return found.id;
    return await saveProduct(db, code, name, price);     
};
const getProductByCode = async (db: mysql.Connection, code: string): Promise<Product | null> => {
    const query = `
        SELECT  
            p.id,
            p.name,
            p.code,
            p.unit_value,
            p.stock
        FROM ${TableName.PRODUCTS} AS p
        WHERE p.code = ?
    `;
    const [rows] = (await db.execute(query, [code]) as unknown) as [Product[], any];
    return rows[0] || null;
}
export const saveProduct = async (
    db: mysql.Connection,
    code: string,
    name: string,
    price: number,
): Promise<number> => {
    const sql = `
    INSERT INTO ${TableName.PRODUCTS} (
      code, name, sale_unit_price, unit_value, created_at
    ) VALUES (?, ?, ?, ?, NOW());
  `;
    const [r] = await db.execute<mysql.ResultSetHeader>(sql, [code, name, price, price]);
    return r.insertId;
};
export const productDatasource = {
    getProducts,
    getProductByCode,
    saveProduct,
    upsertProductCampo
};
