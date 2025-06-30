import { PoolClient } from 'pg';
import { PendingReservation } from '../interfaces/api/api-reservas-response.interface';
import { SucursalDatasource } from '../datasource/db/sucursal-datasource';
import { CustomerDatasource } from '../datasource/db/client-datasource';
import { mapPendingToSaleNote } from '../interfaces/mappers/pending-to-sale-note.mapper';
import { productDatasource } from '../datasource/db/product-datasouce';
import { Product } from '../interfaces/database/product.interface';
import { insertSaleNoteTx } from '../datasource/db/sale-note.datasource';

export async function importReservation(
    db: PoolClient,
    pending: PendingReservation
): Promise<void> {
    /* ── 1. Sucursal ───────────────────────────── */
    const establishmentId = await SucursalDatasource.getSucursalByCode(
        db,
        pending.idSede
    );

    /* ── 2. Cliente ───────────────────────────── */
    if (!pending.factura) {
        throw new Error('La factura de la reserva pendiente es nula');
    }

    const customerId = await CustomerDatasource.upsertCustomerByDocument(
        db,
        pending.factura.numeroDocumento,
        pending.factura.razonSocial,
        pending.factura.direccion
    );

    /* ── 3. Productos y diccionario code → id ──────────────── */
    const productIdMap: Record<string, Product> = {};
    for (const d of pending.detalleReservas) {
        const product = await productDatasource.upsertProductCampo(
            db,
            d.campo.idCampo,
            d.campo.nombre,
            Number(d.precio)
        );
        productIdMap[d.campo.idCampo] = product;
    }

    try {
        /* ── 4. Mapper → cabecera + ítems ───────────── */
        const payload = await mapPendingToSaleNote(
            pending,
            customerId,
            establishmentId ?? 1,
            productIdMap
        );

        await db.query('BEGIN');
        await insertSaleNoteTx(db, payload);
        // TODO: Confirmar migración si se implementa funcionalidad propia
        await db.query('COMMIT');
    } catch (err) {
        await db.query('ROLLBACK');
        throw err;
    }
}
