import axios from "axios";
import { DocRow, EstadoDescripcion } from "../types/document.interface";
import { getDocumentFileStreams } from "../utils/fileHelper";
import FormData from 'form-data';
import { appendDocumentAttachments } from "../utils/formHelper";
import { TenantInfo } from "../types/tenant.interface";
import { mapDocumentToUploadPayload } from "../mappers/doc-to-upload-payload";
import { UPDATE_ENDPOINT, UPLOAD_ENDPOINT } from "../config/endpoints";

interface ResponseExternalApi {
    cpeId: string,
    urlPdf: string,
    urlXml: string,
    urlCdr: string
}
export async function uploadSendToExternalApi(
    doc: DocRow,
    schema: string,
    tenant: TenantInfo
): Promise<
    {
        status: boolean,
        data: ResponseExternalApi
    }> {
    const identifier = doc.unique_filename ?? doc.external_id;
    const form = new FormData();
    const { streams, urls } = await getDocumentFileStreams(schema, identifier);
    const payload = await mapDocumentToUploadPayload(doc, tenant, urls);
    form.append('data', JSON.stringify(payload));
    appendDocumentAttachments(form, streams);
    const resp = await axios.post(UPLOAD_ENDPOINT, form, {
        headers: form.getHeaders(),
    });
    console.log(resp.data);
    return {
        status: resp.status === 200,
        data: resp.data.data
    };
}

export async function updateSendToExternalApi(
    doc: DocRow,
): Promise<{
    status: boolean;
    data: ResponseExternalApi;
}> {
    const payload = {
        id: doc.migrated_document_id,
        estado: EstadoDescripcion[doc.state_type_id],
    };
    const resp = await axios.post(UPDATE_ENDPOINT, payload, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    console.log(resp.data);
    return {
        status: resp.status === 200,
        data: resp.data.data,
    };
}