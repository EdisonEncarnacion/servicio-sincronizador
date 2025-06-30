import { PoolClient } from 'pg';
import { Sucursal } from '../../interfaces/database/sucursal.interface';
import { TableName } from '../../config/table-names';

const getSucursales = async (db: PoolClient): Promise<Sucursal[]> => {
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
  const result = await db.query(query);
  return result.rows;
};

const getSucursalById = async (
  db: PoolClient,
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
    WHERE s.id = $1;
  `;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

const getSucursalIdByInformationAditional = async (
  db: PoolClient,
  code: string
): Promise<number | null> => {
  const query = `
    SELECT
      s.id
    FROM ${TableName.SUCURSALES} AS s
    WHERE s.aditional_information = $1;
  `;
  const result = await db.query(query, [code]);
  return result.rows[0]?.id || null;
};

const saveSucursal = async (
  db: PoolClient,
  code: string,
  description: string
): Promise<number> => {
  const query = `
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
      $1, $2, 1, 1, 1, 1, 'TEST', 'TEST', 'TEST'
    )
    RETURNING id;
  `;
  const result = await db.query(query, [code, description]);
  return result.rows[0].id;
};

const upsertSucursal = async (
  db: PoolClient,
  code: string,
  description: string
): Promise<number> => {
  const existingId = await getSucursalIdByInformationAditional(db, code);
  if (existingId) return existingId;
  return await saveSucursal(db, code, description);
};

export const SucursalDatasource = {
  getSucursales,
  getSucursalById,
  getSucursalByCode: getSucursalIdByInformationAditional,
  saveSucursal,
  upsertSucursal
};
