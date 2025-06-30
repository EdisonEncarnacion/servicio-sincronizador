import { PoolClient } from 'pg';
import { Product } from '../../interfaces/database/product.interface';
import { TableName } from '../../config/table-names';

const getProducts = async (db: PoolClient): Promise<Product[]> => {
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
    const result = await db.query(query);
    return result.rows;
};

const getProductByCode = async (db: PoolClient, code: string): Promise<Product | null> => {
    const query = `
        SELECT  
            p.id,
            p.name,
            p.factory_code,
            p.stock,
            p.description
        FROM ${TableName.PRODUCTS} AS p
        WHERE p.factory_code = $1
    `;
    const result = await db.query(query, [code]);
    return result.rows[0] || null;
};

const saveProduct = async (
    db: PoolClient,
    code: string,
    name: string,
    price: number
): Promise<number> => {
    const sql = `
        INSERT INTO ${TableName.PRODUCTS} (
            factory_code, name, sale_unit_price, item_type_id, unit_type_id, currency_type_id,
            sale_affectation_igv_type_id, purchase_affectation_igv_type_id, description, text_filter
        ) VALUES ($1, $2, $3, '01', 'NIU', 'PEN', '10', '10', $4, $5)
        RETURNING id;
    `;
    const values = [code, name, price, `CANCHA ${name}`, name];
    const result = await db.query(sql, values);
    return result.rows[0].id;
};

const upsertProductCampo = async (
    db: PoolClient,
    code: string,
    name: string,
    price: number
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

export const productDatasource = {
    getProducts,
    getProductByCode,
    saveProduct,
    upsertProductCampo
};
