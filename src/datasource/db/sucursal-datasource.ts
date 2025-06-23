
import mysql from 'mysql2/promise';
import { Sucursal } from '../../interfaces/database/sucursal.interface';
import { TableName } from '../../config/table-names';


const getSucursales = async (db: mysql.Connection): Promise<Sucursal[]> => {
  const query = `
    SELECT
      s.id,
      s.description,
      s.country_id,
      s.department_id,
      s.province_id,
      s.district_id,
      s.address,
      s.email,
      s.telephone,
      s.code,
      s.customer_id,
      s.created_at
    FROM ${TableName.SUCURSALES} AS s
    ORDER BY s.created_at DESC;
  `;
  const [rows] = (await db.execute(query) as unknown) as [Sucursal[], any];
  return rows;
};
const getSucursalById = async (
  db: mysql.Connection,
  id: number
): Promise<Sucursal | null> => {
  const query = `
    SELECT
      s.id,
      s.description,
      s.country_id,
      s.department_id,
      s.province_id,
      s.district_id,
      s.address,
      s.email,
      s.telephone,
      s.code,
      s.customer_id,
      s.created_at
    FROM ${TableName.SUCURSALES} AS s
    WHERE s.id = ?;
  `;
  const [rows] = (await db.execute(query, [id]) as unknown) as [Sucursal[], any];
  return rows[0] || null;
};
const getSucursalIdByInformationAditional = async (
  db: mysql.Connection,
  code: string
): Promise<number | null> => {
  const query = `
      SELECT
        s.id,
        s.description,
        s.country_id,
        s.department_id,
        s.province_id,
        s.district_id,
        s.address,
        s.email,
        s.telephone,
        s.code,
        s.customer_id,
        s.created_at
      FROM ${TableName.SUCURSALES} AS s
      WHERE s.aditional_information = ?;
  `;

  const [rows] = (await db.execute(query, [code]) as unknown) as [Sucursal[], any];
  return rows[0].id || null;
};
const saveSucursal = async (
  db: mysql.Connection,
  code: string,
  description: string,
): Promise<number> => {
  const sql = `
    INSERT INTO ${TableName.SUCURSALES} (
      code,
      description,
      country_id,
      department_id,
      province_id,
      district_id,
      address,
      email,
      telephone
    ) VALUES (
      ?, ?,1, 1, 1, 1,'TEST', 'TEST', 'TEST'
    );
  `;
  const [res] = await db.execute<mysql.ResultSetHeader>(sql, [code, description]);
  return res.insertId;
};
const upsertSucursal = async (
  db: mysql.Connection,
  code: string,
  description: string,
): Promise<number> => {
  const found = await getSucursalIdByInformationAditional(db, code);
  if (found) return found;

  return await saveSucursal(db, code, description);
}
export const SucursalDatasource = {
  getSucursales,
  getSucursalById,
  getSucursalByCode: getSucursalIdByInformationAditional,
  saveSucursal,
  upsertSucursal
};
