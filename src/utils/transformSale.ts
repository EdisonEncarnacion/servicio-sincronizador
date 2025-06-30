import {
    mapCashRegisters,
    mapClients,
    mapDocumentTypes,
    mapLocales,
    mapPaymentTypes,
    mapSides,
    mapUsers,
    mapTransactions,
    mapSales,
} from '../mappings/id-maps';
import { randomUUID } from 'crypto';

export function transformSaleToBackoffice(sale: any, saleDetails: any[]): any {
    const saleUUID = mapSales[sale.id_sale] || randomUUID();

    // Validaciones
    if (!mapClients[sale.id_client]) throw new Error(`Falta mapear sale.id_client = ${sale.id_client}`);
    if (!mapUsers[sale.id_user]) throw new Error(`Falta mapear sale.id_user = ${sale.id_user}`);
    if (!mapPaymentTypes[sale.id_payment_type]) throw new Error(`Falta mapear sale.id_payment_type = ${sale.id_payment_type}`);
    if (!mapDocumentTypes[sale.id_sale_document_type]) throw new Error(`Falta mapear sale.id_sale_document_type = ${sale.id_sale_document_type}`);
    if (!mapCashRegisters[sale.id_cash_register]) throw new Error(`Falta mapear sale.id_cash_register = ${sale.id_cash_register}`);
    if (!mapLocales[sale.id_local]) throw new Error(`Falta mapear sale.id_local = ${sale.id_local}`);

    return {
        sale: {
            id_sale: saleUUID,
            document_number: sale.document_number,
            total_amount: parseFloat(sale.total_amount),
            subtotal: parseFloat(sale.subtotal),
            total_discount: parseFloat(sale.total_discount),
            created_at: sale.created_at,
            updated_at: sale.updated_at ?? new Date(),
            state: sale.state ?? 1,
            op_grabada: sale.op_grabada ?? parseFloat(sale.subtotal),
            total_tax: sale.total_tax ?? 0,
            transferencia_gratuita: sale.transferencia_gratuita ?? 0,
            exonerado: sale.exonerado ?? 0,
            id_client: mapClients[sale.id_client],
            id_user: mapUsers[sale.id_user],
            id_payment_type: mapPaymentTypes[sale.id_payment_type],
            id_sale_document_type: mapDocumentTypes[sale.id_sale_document_type], // ✅ nombre correcto
            id_cash_register: mapCashRegisters[sale.id_cash_register],
            id_local: mapLocales[sale.id_local],
        },
        sale_details: saleDetails.map((detail: any) => {
            if (!mapSides[detail.id_side]) throw new Error(`Falta mapear detail.id_side = ${detail.id_side}`);
            if (!mapTransactions[detail.id_transaction]) throw new Error(`Falta mapear detail.id_transaction = ${detail.id_transaction}`);

            return {
                id_sale_detail: randomUUID(),
                quantity: parseFloat(detail.quantity),
                product_price: parseFloat(detail.product_price),
                tax_detail:
                    typeof detail.tax_detail === 'object'
                        ? detail.tax_detail.amount
                        : parseFloat(detail.tax_detail),
                total_amount: parseFloat(detail.total_amount),
                system_date: detail.system_date,
                id_transaction: mapTransactions[detail.id_transaction],
                id_product: String(detail.id_product), // ← asegúrate que sea string
                id_sale: saleUUID,
                id_side: mapSides[detail.id_side],
            };
        }),
    };
}
