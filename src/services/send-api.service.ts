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
        data: ResponseExternalApi,
        uploadFiles: boolean
    }> {
    const identifier = doc.unique_filename ?? doc.external_id;
    const form = new FormData();
    const { existsFiles, streams, urls } = await getDocumentFileStreams(schema, identifier);
    const payload = await mapDocumentToUploadPayload(doc, tenant, existsFiles, urls);
    if (existsFiles) {
        form.append('data', JSON.stringify(payload));
        appendDocumentAttachments(form, streams);
        const resp = await axios.post(UPLOAD_ENDPOINT, form, {
            headers: form.getHeaders(),
        });
        console.log(resp.data);
        return {
            status: resp.status === 200,
            data: resp.data.data,
            uploadFiles: true
        };
    }
    const resp = await axios.post(UPLOAD_ENDPOINT, payload, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    console.log(resp.data);
    return {
        status: resp.status === 200,
        data: resp.data.data,
        uploadFiles: false
    }
}

export async function updateSendToExternalApi(
    doc: DocRow,
    migrateFiles: boolean,
    schema: string,
    tenant: TenantInfo
): Promise<{
    status: boolean;
    data: ResponseExternalApi;
    uploadFiles: boolean;
}> {
    const payload = {
        id: doc.migrated_document_id,
        estado: EstadoDescripcion[doc.state_type_id],
    };
    if (migrateFiles) {
        const identifier = doc.unique_filename ?? doc.external_id;
        const form = new FormData();
        const { existsFiles, streams, urls } = await getDocumentFileStreams(schema, identifier);
        if (existsFiles) {
            form.append('data', JSON.stringify(payload));
            appendDocumentAttachments(form, streams);
            const resp = await axios.post(UPDATE_ENDPOINT, form, {
                headers: form.getHeaders(),
            });
            return {
                status: resp.status === 200,
                data: resp.data.data,
                uploadFiles: true
            };
        }
    }
    const resp = await axios.post(UPDATE_ENDPOINT, payload, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    console.log(resp.data);
    return {
        status: resp.status === 200,
        data: resp.data.data,
        uploadFiles: false
    };
}