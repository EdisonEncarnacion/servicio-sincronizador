import { PendingReservation } from "../api/api-reservas-response.interface";
import { SaleNoteItem } from "../database/sale-note-item.interface";
import { SaleNoteDocument } from "../database/sale-note.interface";


export interface SaleNoteInsert {
    note: Partial<SaleNoteDocument>;   
    items: Omit<SaleNoteItem, 'id' | 'sale_note_id'>[];
}
export function mapPendingToSaleNote(
    p: PendingReservation,
    customerId: number,
    establishmentId: number,
): SaleNoteInsert {
    const first = p.detalleReservas[0];
    const items = p.detalleReservas.map((d: any) => ({
        item_id: d.campo.idCampo as unknown as number,
        item: d.campo, 
        quantity: 1,
        unit_value: Number(d.precio),
        affectation_igv_type_id: '10',
        total_base_igv: 0,
        percentage_igv: 0,
        total_igv: 0,
        system_isc_type_id: null,
        total_base_isc: 0,
        percentage_isc: 0,
        total_isc: 0,
        total_base_other_taxes: 0,
        percentage_other_taxes: 0,
        total_other_taxes: 0,
        total_plastic_bag_taxes: 0,
        total_taxes: 0,
        price_type_id: '01',
        unit_price: Number(d.precio),
        total_value: Number(d.precio),
        total_charge: 0,
        total_discount: 0,
        total: Number(d.precio),
        attributes: [],
        discounts: [],
        charges: [],
        additional_information: null,
        inventory_kardex_id: 0,
        warehouse_id: 1,
        name_product_pdf: d.campo.nombre,
        modify_sale_unit_price: 0,
    }));

    const monetaryTotal = items
        .reduce((s, i) => s + i.total, 0)
        .toFixed(2);

    return {
        note: {
            external_id: p.idReserva,
            establishment_id: establishmentId,
            customer_id: customerId,
            series: p.codigoReserva.slice(0, 4),
            number: Number(p.codigoReserva.slice(4)),
            date_of_issue: first.fecha.slice(0, 10),
            time_of_issue: first.horaInicio,
            currency_type_id: 'PEN',
            soap_type_id: '01',
            state_type_id: '01',
            prefix: 'SN',
            exchange_rate_sale: 1,
            total: Number(monetaryTotal),
            subtotal: Number(monetaryTotal),
            total_value: Number(monetaryTotal),
            total_taxes: 0,
            created_from_pos: 0,
            apply_concurrency: 0,
            enabled_concurrency: 0,
            dispatch_ticket_pdf: 0,
            dispatch_ticket_pdf_quantity: 1,
            total_prepayment: 0,
        },
        items,
    };
}
