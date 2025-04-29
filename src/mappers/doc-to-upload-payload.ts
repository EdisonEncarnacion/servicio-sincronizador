import { Document } from "../types/document.interface";
import { TenantInfo } from "../types/tenant.interface";
export interface UploadPayload {
    id: string;
    fechaPublicacion: Date;
    fechaCpe: Date;
    horaCpe: string;
    rucEmisor: string;
    nombreEmisor: string;
    tipoCpe: string;
    serieCpe: string;
    numeroCpe: string;
    monedaCpe: string;
    tipoDocReceptor: string;
    rucReceptor: string;
    nombreReceptor: string;
    totalCpe: number;
    estadoProccess: string;
    estadoCpe: string;
    fechaCdr: string;
    horaCdr: string;
    codigoRespuesta: string;
    descripcionRespuesta: string;
    Sucursal: string;
}
export function mapDocumentToUploadPayload(
    doc: Document,
    tenant: TenantInfo
): UploadPayload {
    return {
        id: doc.external_id,
        fechaPublicacion: doc.created_at ? new Date(doc.created_at) : new Date(),
        fechaCpe: new Date(doc.date_of_issue),
        horaCpe: doc.time_of_issue,
        rucEmisor: tenant.ruc ?? '',
        nombreEmisor: tenant.name ?? '',
        tipoCpe: doc.document_type_id,
        serieCpe: doc.series,
        numeroCpe: String(doc.number),
        monedaCpe: doc.currency_type_id,
        tipoDocReceptor: '6',
        rucReceptor: String(doc.customer_id),
        nombreReceptor: doc.customer,
        totalCpe: parseFloat(doc.total) || 0,
        estadoProccess: doc.shipping_status ?? '',
        estadoCpe: doc.state_type_id,
        fechaCdr: new Date().toISOString().slice(0, 10),
        horaCdr: new Date().toTimeString().split(' ')[0],
        codigoRespuesta: doc.soap_shipping_response
            ? JSON.parse(doc.soap_shipping_response).code
            : '',
        descripcionRespuesta: doc.soap_shipping_response
            ? JSON.parse(doc.soap_shipping_response).description
            : '',
        Sucursal: tenant.name ?? '',
    };
}