import axios from "axios";
import { DocRow, EstadoDescripcion } from "../types/document.interface";
import { getDocumentFileStreams } from "../utils/fileHelper";
import FormData from 'form-data';
import { appendDocumentAttachments } from "../utils/formHelper";
import { TenantInfo } from "../types/tenant.interface";
import { mapDocumentToUploadPayload } from "../mappers/doc-to-upload-payload";
import { UPDATE_ENDPOINT, UPLOAD_ENDPOINT } from "../config/endpoints";
import { DocRowCustom } from "./document.service";
import { DispatchRow } from "../types/dispatch.interface";
import { fetchDispatchItems } from "./dispatch-items.service";
import { mapDispatchToUploadPayload } from "../mappers/dispatch-to-upload-payload";
import { DispatchRowCustom } from "./dispatch.service";

interface ResponseExternalApi {
    cpeId: string,
    urlPdf: string,
    urlXml: string,
    urlCdr: string
}
export async function uploadDispatchToExternalApi(
    conn: any,
    dispatch: DispatchRowCustom,
    schema: string,
    tenant: TenantInfo
): Promise<{ status: boolean; uploadFiles: boolean; data?: any }> {
    const identifier = dispatch.filename
    const items = await fetchDispatchItems(conn, schema, dispatch.id);
    const { existsFiles, streams, urls } = await getDocumentFileStreams(schema, identifier);
    const payload = await mapDispatchToUploadPayload(dispatch, items, existsFiles, urls, tenant);

    if (existsFiles) {
        const form = new FormData();
        form.append('data', JSON.stringify(payload));
        appendDocumentAttachments(form, streams);
        const resp = await axios.post(UPLOAD_ENDPOINT, form, {
            headers: form.getHeaders(),
        });
        return { status: resp.status === 200, uploadFiles: true, data: resp.data.data };
    }
    const resp = await axios.post(UPLOAD_ENDPOINT, { data: payload }, {
        headers: { 'Content-Type': 'application/json' }
    });
    return { status: resp.status === 200, uploadFiles: false, data: resp.data.data };
}
export async function updateDispatchToExternalApi(
    dispatch: DispatchRow,
    migrateFiles: boolean,
    schema: string,
    tenant: TenantInfo
): Promise<{
    status: boolean;
    data: ResponseExternalApi;
    uploadFiles: boolean;
}> {
    const payload = {
        id: dispatch.migrated_document_id,
        estado: EstadoDescripcion[dispatch.state_type_id],
    };
    if (migrateFiles) {
        const identifier = dispatch.filename;
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
                uploadFiles: true,
            };
        }
    }
    const resp = await axios.post(UPDATE_ENDPOINT, {
        data: payload,
    }, {
        headers: { 'Content-Type': 'application/json' },
    });

    return {
        status: resp.status === 200,
        data: resp.data.data,
        uploadFiles: false,
    };
}
export async function uploadSendToExternalApi(
    doc: DocRowCustom,
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
    const resp = await axios.post(UPLOAD_ENDPOINT, {
        data: payload
    }, {
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
    doc: DispatchRowCustom | DocRow,
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
    const resp = await axios.post(UPDATE_ENDPOINT, {
        data: payload
    }, {
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