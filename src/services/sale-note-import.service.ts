import mysql from 'mysql2/promise';
import { PendingReservation } from '../interfaces/api/api-reservas-response.interface';
import { SucursalDatasource } from '../datasource/db/sucursal-datasource';
import { CustomerDatasource } from '../datasource/db/client-datasource';
import { productDatasource } from '../datasource/db/product-datasouce';
import { mapPendingToSaleNote } from '../interfaces/mappers/pending-to-sale-note.mapper';
import { insertSaleNote } from '../datasource/db/sale-note.datasource';
import { ReservationDatasource } from '../datasource/api/reservation-datasource';

export async function importReservation(
    db: mysql.Connection,
    pending: PendingReservation,
): Promise<void> {
    const establishmentId = await SucursalDatasource.upsertSucursal(db, pending.idSede, pending.nombreSede);
    const customerId = pending.factura
        ? await CustomerDatasource.upsertCustomerByDocument(
            db,
            pending.factura.numeroDocumento,
            pending.factura.razonSocial,
            pending.factura.direccion,
        )
        : 1; // “cliente genérico” 
    for (const d of pending.detalleReservas) {
        await productDatasource.upsertProductCampo(db, d.campo.idCampo, d.campo.nombre, Number(d.precio));
    }
    const payload = mapPendingToSaleNote(pending, customerId, establishmentId);
    await insertSaleNote(db, payload);
    /** Confirmar migración en API */
    await ReservationDatasource.confirmReservationMigration(pending.idReserva);
}
