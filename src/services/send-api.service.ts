import axios from "axios";
import { DocRow } from "../types/document.interface";
import { FileStream, getDocumentFileStreams } from "../utils/fileHelper";
import { EXTERNAL_API_URL } from "../config/env";
import FormData from 'form-data';
import { appendDocumentAttachments } from "../utils/formHelper";
import { TenantInfo } from "../types/tenant.interface";
import { mapDocumentToUploadPayload } from "../mappers/doc-to-upload-payload";

export async function sendToExternalApi(
    doc: DocRow,
    schema: string,
    tenant: TenantInfo
): Promise<boolean> {
    const identifier = doc.unique_filename ?? doc.external_id;
    const form = new FormData();
    const payload = mapDocumentToUploadPayload(doc, tenant);
    form.append('data', JSON.stringify(payload));
    const streams = getDocumentFileStreams(schema, identifier);
    appendDocumentAttachments(form, streams);
    const resp = await axios.post(EXTERNAL_API_URL, form, {
        headers: form.getHeaders(),
    });
    return resp.status === 200;
}