import axios from "axios";
import { DocRow } from "../types/document.interface";
import { extractCdrTimestampsFromXml, FileStream, getDocumentFileStreams } from "../utils/fileHelper";
import { EXTERNAL_API_URL } from "../config/env";
import FormData from 'form-data';
import { appendDocumentAttachments } from "../utils/formHelper";
import { TenantInfo } from "../types/tenant.interface";
import { mapDocumentToUploadPayload } from "../mappers/doc-to-upload-payload";
import { url } from "inspector";

export async function sendToExternalApi(
    doc: DocRow,
    schema: string,
    tenant: TenantInfo
): Promise<boolean> {
    const identifier = doc.unique_filename ?? doc.external_id;
    const form = new FormData();

    const { streams, urls } = await getDocumentFileStreams(schema, identifier);

    const payload = await mapDocumentToUploadPayload(doc, tenant, urls);
    form.append('data', JSON.stringify(payload));
    appendDocumentAttachments(form, streams);
    const resp = await axios.post(EXTERNAL_API_URL, form, {
        headers: form.getHeaders(),
    });
    return resp.status === 200;
}