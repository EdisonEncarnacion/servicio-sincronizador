import { Document, EstadoDescripcion } from "../types/document.interface";
import { TenantInfo } from "../types/tenant.interface";
import { extractCdrTimestampsFromXml } from "../utils/fileHelper";
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
    // Totales
    totalDescuentos: number;
    totalOtrosCargos: number;
    totalGravado: number;
    totalExonerado: number;
    totalInafecto: number;
    totalGratuito: number;
    totalICBPR: number;
    totalIgv: number;
    totalIsc: number;
    totalOtrosTributos: number;
    indValido: 1
}

export async function mapDocumentToUploadPayload(
    doc: Document,
    tenant: TenantInfo,
    existsFiles: boolean,
    urls: {
        urlCrd: string;
        urlPdf: string;
        urlXmlSigned: string;
    }
): Promise<UploadPayload> {
    let dataCdr = null
    if (existsFiles) {
        dataCdr = await extractCdrTimestampsFromXml(urls.urlCrd);
    }
    return {
        id: `${tenant.ruc}-${doc.document_type_id}-${doc.series}-${doc.number}`,
        fechaPublicacion: doc.created_at ? new Date(doc.created_at) : new Date(),
        fechaCpe: new Date(doc.date_of_issue),
        horaCpe: doc.time_of_issue,
        rucEmisor: tenant.ruc ?? '',
        nombreEmisor: tenant.name ?? '',
        tipoCpe: doc.document_type_id,
        serieCpe: doc.series,
        numeroCpe: String(doc.number),
        monedaCpe: doc.currency_type_id,
        tipoDocReceptor: doc.customer.identity_document_type_id ?? 'NO ENCONTRADO',
        rucReceptor: doc.customer.number ?? 'NO ENCONTRADO',
        nombreReceptor: doc.customer.name ?? JSON.stringify(doc.customer),
        totalCpe: parseFloat(doc.total) || 0,
        estadoProccess: 'SUCCESS',//doc.shipping_status ?? '',
        estadoCpe: EstadoDescripcion[doc.state_type_id] ?? '',
        fechaCdr: dataCdr ? new Date(dataCdr?.responseDate).toISOString() ?? 'NO ENCONTRADO' : 'NO ENCONTRADO',
        horaCdr: dataCdr ? dataCdr?.responseTime ?? 'NO ENCONTRADO' : 'NO ENCONTRADO',
        codigoRespuesta: doc.soap_shipping_response
            ? JSON.parse(doc.soap_shipping_response).code
            : '',
        descripcionRespuesta: doc.soap_shipping_response
            ? JSON.parse(doc.soap_shipping_response).description
            : '',
        Sucursal: tenant.name ?? '',
        totalDescuentos: Number(doc.total_discount),
        totalOtrosCargos: Number(doc.total_other_taxes),
        totalGravado: Number(doc.total_taxed),
        totalExonerado: Number(doc.total_exonerated),
        totalInafecto: Number(doc.total_unaffected),
        totalGratuito: Number(doc.total_free),
        totalICBPR: Number(doc.total_plastic_bag_taxes),
        totalIgv: Number(doc.total_igv),
        totalIsc: Number(doc.total_isc),
        totalOtrosTributos: 0,
        indValido: 1

    };
}