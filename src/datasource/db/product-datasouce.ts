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
): Promise<Product> => {
    const found = await getProductByCode(db, code);
    if (found) return found;
    await saveProduct(db, code, name, price);
    const product = await getProductByCode(db, code);
    if (!product) {
        throw new Error(`Producto con código ${code} no encontrado después de guardar.`);
    }

    return product;
};
const getProductByCode = async (db: mysql.Connection, code: string): Promise<Product | null> => {
    console.log('==')
    const query = `
        SELECT  
            p.id,
            p.name,
            p.factory_code,
            p.stock,
            p.description
        FROM ${TableName.PRODUCTS} AS p
        WHERE p.factory_code = ?
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
      factory_code, name, sale_unit_price,item_type_id,unit_type_id,currency_type_id,sale_affectation_igv_type_id,purchase_affectation_igv_type_id,description,text_filter
    ) VALUES (?, ?, ?,'01','NIU','PEN','10','10', ?,?);
  `;
    const [r] = await db.execute<mysql.ResultSetHeader>(sql, [code, name, price, 'CANCHA ' + name, name]);
    return r.insertId;
};
export const productDatasource = {
    getProducts,
    getProductByCode,
    saveProduct,
    upsertProductCampo
};
