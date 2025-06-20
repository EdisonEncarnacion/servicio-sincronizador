import { TenantInfo } from '../interfaces/tenant.interface';
import { DispatchRow } from '../interfaces/dispatch.interface';
import { UploadPayload } from './doc-to-upload-payload';
import { DispatchItemRow } from '../services/dispatch-items.service';
import { extractCdrTimestampsFromXml } from '../utils/fileHelper';
import { DispatchRowCustom } from '../services/dispatch.service';
import { Estado, EstadoDescripcion } from '../interfaces/database/document.interface';

export async function mapDispatchToUploadPayload(
    dispatch: DispatchRowCustom,
    dispatchItems: DispatchItemRow[],
    existsFiles: boolean,
    urls: {
        urlCrd: string;
        urlPdf: string;
        urlXmlSigned: string;
    },
    tenant: TenantInfo
): Promise<UploadPayload> {
    let dataCdr = null
    if (existsFiles) {
        dataCdr = await extractCdrTimestampsFromXml(urls.urlCrd);
    }
    return {
        id: dispatch.filename,
        fechaPublicacion: new Date(dispatch.created_at),
        fechaCpe: new Date(dispatch.date_of_issue),
        horaCpe: dispatch.time_of_issue,
        rucEmisor: tenant.ruc!,
        nombreEmisor: tenant.name!,
        tipoCpe: dispatch.document_type_id,
        serieCpe: dispatch.series,
        numeroCpe: dispatch.number.toString(),
        monedaCpe: '-',
        tipoDocReceptor: dispatch.customer.identity_document_type_id ?? 'NO ENCONTRADO',
        rucReceptor: dispatch.customer.number ?? 'NO ENCONTRADO',
        nombreReceptor: dispatch.customer.name,
        totalCpe: 0,//Number(dispatch.total_weight),
        estadoProccess: 'SUCCESS',
        estadoCpe: EstadoDescripcion[dispatch.state_type_id] ?? '',
        fechaCdr: dataCdr ? new Date(dataCdr?.responseDate).toISOString() : '',
        horaCdr: dataCdr ? dataCdr?.responseTime : '',
        codigoRespuesta: dispatch.soap_shipping_response
            ? JSON.parse(dispatch.soap_shipping_response).code
            : dispatch.state_type_id.toString(),
        descripcionRespuesta: dispatch.soap_shipping_response
            ? JSON.parse(dispatch.soap_shipping_response).description
            : dispatch.message_ticket,
        Sucursal: dispatch.descripcionEstablecimiento ?? '',
        totalDescuentos: 0,
        totalOtrosCargos: 0,
        totalGravado: 0,
        totalExonerado: 0,
        totalInafecto: 0,
        totalGratuito: 0,
        totalICBPR: 0,
        totalIgv: 0,
        totalIsc: 0,
        totalOtrosTributos: 0,
        indValido: dispatch.state_type_id !== Estado.RECHAZADO ? 1 : 0,
        rawData: JSON.stringify({ ...dispatch, items: dispatchItems }),
    };
}
