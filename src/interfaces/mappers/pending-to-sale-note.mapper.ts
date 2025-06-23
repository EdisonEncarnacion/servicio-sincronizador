import { json } from 'express';
import { PendingReservation } from '../api/api-reservas-response.interface';
import { Customer } from '../database/document.interface';
import { Person } from '../database/person.inteface';
import { Product } from '../database/product.interface';
import { SaleNoteItem } from '../database/sale-note-item.interface';
import { SaleNoteDocument } from '../database/sale-note.interface';
import { Sucursal } from '../database/sucursal.interface';
import { config } from '../../config/env';

export interface SaleNoteInsert {
    note: Partial<SaleNoteDocument>;
    items: Omit<SaleNoteItem, 'id' | 'sale_note_id' | 'item'>[];
}

export function mapPendingToSaleNote(
    p: PendingReservation,
    customer: Person,
    establishmentId: number,
    productIdMap: Record<string, Product>,
): SaleNoteInsert {
    const first = p.detalleReservas[0];
    const items = p.detalleReservas.map((d) => ({
        item_id: productIdMap[d.campo.idCampo].id,
        item: JSON.stringify(productIdMap[d.campo.idCampo]),
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
        inventory_kardex_id: 1,
        warehouse_id: 1,
        name_product_pdf: d.campo.nombre,
        modify_sale_unit_price: 0,
    }));
    const total = items.reduce((sum, i) => sum + i.total, 0);
    return {
        note: {
            user_id: 1,
            external_id: p.idReserva,
            establishment_id: establishmentId,
            establishment: {
                id: establishmentId,
                name: "",
                address: "",
                phone: "",
            } as unknown as Sucursal,
            customer_id: customer.id,
            customer: JSON.stringify({
                location: null,
                identity_document_type_id: "6",
                bank_name: null,
                bank_account_number: null,
                identity_document_type: {
                    id: "6",
                    description: "RUC",
                },
                number: customer.number,
                name: customer.name,
                trade_name: null,
                is_driver: false,
                country_id: "PE",
                country: {
                    id: "PE",
                    description: "PERU",
                },
                department_id: "04",
                department: {
                    id: "04",
                    description: "AREQUIPA",
                },
                province_id: "0401",
                province: {
                    id: "0401",
                    description: "Arequipa",
                },
                district_id: "040129",
                district: {
                    id: "040129",
                    description: "José Luis Bustamante Y Rivero",
                },
                address: "CAL. LA PLATA NRO. 134 COO. 58 INT. 502",
                email: null,
                telephone: null,
                perception_agent: false,
                address_id: "main",
                internal_id: null,
                internal_code: null,
                address_type_id: null,
                address_type: {
                    id: null,
                    description: null,
                },
                search_telephone: null,
            }) as any,
            series: config.DOCUMENT_SERIE,
            number: Math.floor(Math.random() * 10000000) + 1,
            date_of_issue: p.fechaCreacion.split('T')[0],
            time_of_issue: p.fechaCreacion.slice(11, 19),
            currency_type_id: 'PEN',
            soap_type_id: '01',
            state_type_id: '01',
            prefix: 'NV',
            exchange_rate_sale: 1,
            total,
            subtotal: total,
            total_value: total,
            total_taxes: 0,
            created_from_pos: 0,
            apply_concurrency: 0,
            enabled_concurrency: 0,
            dispatch_ticket_pdf: 0,
            dispatch_ticket_pdf_quantity: 1,
            total_prepayment: 0,
            payment_condition_id: '01',
            quantity_period: 0,
            charges: [],
            guides: [],
            discounts: [],
            seller_id: 1,
            cash_id: 1,
            paid:1


        },
        items,
    };
}
