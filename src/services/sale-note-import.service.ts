import mysql from 'mysql2/promise';
import { PendingReservation } from '../interfaces/api/api-reservas-response.interface';
import { SucursalDatasource } from '../datasource/db/sucursal-datasource';
import { CustomerDatasource } from '../datasource/db/client-datasource';
import { mapPendingToSaleNote } from '../interfaces/mappers/pending-to-sale-note.mapper';
import { ReservationDatasource } from '../datasource/api/reservation-datasource';
import { productDatasource } from '../datasource/db/product-datasouce';
import { Product } from '../interfaces/database/product.interface';
import { insertSaleNoteTx } from '../datasource/db/sale-note.datasource';

export async function importReservation(
    db: mysql.Connection,
    pending: PendingReservation,
): Promise<void> {
    /* ── 1. Sucursal (establecimiento) ───────────────────────────── */
    const establishmentId = await SucursalDatasource.getSucursalByCode(db, pending.idSede)/* upsertSucursal(
        db,
        pending.idSede,
        pending.nombreSede, 
    ); */
    /* ── 2. Cliente (o “genérico”) ─────────────── */
    if (!pending.factura) {
        throw new Error('La factura de la reserva pendiente es nula');
    }
    const customerId = await CustomerDatasource.upsertCustomerByDocument(
        db,
        pending.factura.numeroDocumento,
        pending.factura.razonSocial,
        pending.factura.direccion,
    )
    /* ── 3. Productos-campo y diccionario code → id ──────────────── */
    const productIdMap: Record<string, Product> = {};
    for (const d of pending.detalleReservas) {
        const productId = await productDatasource.upsertProductCampo(
            db,
            d.campo.idCampo,
            d.campo.nombre,
            Number(d.precio),
        );
        productIdMap[d.campo.idCampo] = productId;
    }
    try {
           /* ── 4. Mapper → cabecera + ítems (con IDs reales) ───────────── */
    const payload = await mapPendingToSaleNote(
        pending,
        customerId,
        establishmentId ?? 1,
        productIdMap,          // ← nuevo parámetro
    );
        await db.beginTransaction();  
        await insertSaleNoteTx(db, payload);             
        await ReservationDatasource.confirmReservationMigration(
            pending.idReserva,
        );                                                 
        await db.commit();                                
    } catch (err) {
        await db.rollback();                               
        throw err;                             
    }
}
