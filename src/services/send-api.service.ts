import axios from "axios";
import { DocRow } from "../types/document";
import { FileStream, getDocumentFileStreams } from "../utils/fileHelper";
import { EXTERNAL_API_URL } from "../config";
import FormData from 'form-data';
import { logger } from "../utils/logger";
import { appendDocumentAttachments } from "../utils/formHelper";

export async function sendToExternalApi(
    doc: DocRow,
    schema: string
): Promise<boolean> {
    const identifier = doc.unique_filename ?? doc.external_id;
    const form = new FormData();
    form.append('data', JSON.stringify(doc));
    const streams = getDocumentFileStreams(schema, identifier);
    appendDocumentAttachments(form, streams);

    const resp = await axios.post(EXTERNAL_API_URL, form, {
        headers: form.getHeaders(),
    });
    return resp.status === 200;
}