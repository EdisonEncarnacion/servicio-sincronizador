import fs from 'fs';
import path from 'path';
import { TENANCY_STORAGE_PATH } from '../config/paths';
import { logger } from '../utils/logger';
import { parseStringPromise } from 'xml2js';
import unzipper from 'unzipper';
import { isNonEmpty } from './global-helper';
export type FileStream = {
    key: string;
    stream: fs.ReadStream;
    filename: string;
};


export async function extractCdrTimestampsFromXml(filePath: string) {
    try {
        let xmlContent: string = '';

        if (filePath.toLowerCase().endsWith('.zip')) {
            const directory = await unzipper.Open.file(filePath);
            const xmlEntry = directory.files.find(f => f.path.toLowerCase().endsWith('.xml'));
            if (!xmlEntry) {
                console.warn('No se encontró XML dentro del ZIP:', filePath);
                return null;
            }
            const xmlBuffer = await xmlEntry.buffer();
            xmlContent = xmlBuffer.toString('utf8');
        }

        if (!xmlContent) {
            xmlContent = fs.readFileSync(filePath, 'utf8');
        }

        const parsed = await parseStringPromise(xmlContent, {
            explicitArray: false,
            tagNameProcessors: [name => name.replace(/^.*:/, '')]
        });

        const resp = parsed.ApplicationResponse;
        if (!resp) return null;

        const { IssueDate, IssueTime, ResponseDate, ResponseTime } = resp;
        if (IssueDate && IssueTime && ResponseDate && ResponseTime) {
            return {
                issueDate: IssueDate,
                issueTime: IssueTime,
                responseDate: ResponseDate,
                responseTime: ResponseTime,
            };
        }

        return null;
    } catch (err) {
        console.error('Error al extraer timestamps del CDR:', err);
        return null;
    }
}

export async function getDocumentFileStreams(
    schema: string,
    identifier: string,
): Promise<{
    existsFiles: boolean,
    streams: FileStream[]
    urls: {
        urlCrd: string,
        urlPdf: string,
        urlXmlSigned: string,
    }
}> {
    const baseDir = path.join(TENANCY_STORAGE_PATH, schema);
    const streams: FileStream[] = [];
    let existsFiles = false;
    let urlCrd = '';
    let urlPdf = '';
    let urlXmlSigned = '';
    // PDF files
    const pdfDir = path.join(baseDir, 'pdf');
    if (!fs.existsSync(pdfDir)) {
        logger.warn(`Directorio PDF no existe: ${pdfDir}`);
    } else {
        const pdfFiles = fs.readdirSync(pdfDir)
            .filter(f => f.startsWith(identifier) && f.endsWith('.pdf'));
        if (pdfFiles.length === 0) {
            logger.warn(`PDF no encontrado en ${pdfDir} para identificador ${identifier}`);
        }

        pdfFiles.forEach(f => {
            if (f.startsWith(identifier) && f.endsWith('.pdf')) {
                urlPdf = path.join(pdfDir, f);
            }
            return streams.push({
                key: 'pdf',
                stream: fs.createReadStream(path.join(pdfDir, f)),
                filename: f,
            })
        }

        );
    }
    // CDR files
    const cdrDir = path.join(baseDir, 'cdr');
    if (!fs.existsSync(cdrDir)) {
        logger.warn(`Directorio CDR no existe: ${cdrDir}`);
    } else {
        const cdrFiles = fs.readdirSync(cdrDir)
            .filter(f =>
                (f.startsWith(`R-${identifier}`) || f.startsWith(`RA-${identifier}`)) &&
                (f.endsWith('.zip') || f.endsWith('.xml'))
            );
        if (cdrFiles.length === 0) {
            logger.warn(`CDR no encontrado en ${cdrDir} para identificador ${identifier}`);
        }

        cdrFiles.forEach(f => {
            if (f.startsWith(`R-${identifier}`) || f.startsWith(`RA-${identifier}`)) {
                urlCrd = path.join(cdrDir, f);
            }
            return streams.push({
                key: 'cdr',
                stream: fs.createReadStream(path.join(cdrDir, f)),
                filename: f,
            })
        }

        );
    }
    // Signed XML files
    const signedDir = path.join(baseDir, 'signed');
    if (!fs.existsSync(signedDir)) {
        logger.warn(`Directorio signed no existe: ${signedDir}`);
    } else {
        const signedFiles = fs.readdirSync(signedDir)
            .filter(f => f.startsWith(identifier) && f.endsWith('.xml'));
        if (signedFiles.length === 0) {
            logger.warn(`XML firmado no encontrado en ${signedDir} para identificador ${identifier}`);
        }
        signedFiles.forEach(f => {
            if (f.startsWith(identifier) && f.endsWith('.xml')) {
                urlXmlSigned = path.join(signedDir, f);
            }
            return streams.push({
                key: 'signed',
                stream: fs.createReadStream(path.join(signedDir, f)),
                filename: f,
            })
        }

        );
    }
    // Unsigned XML files
    const unsignedDir = path.join(baseDir, 'unsigned');
    if (!fs.existsSync(unsignedDir)) {
        logger.warn(`Directorio unsigned no existe: ${unsignedDir}`);
    } else {
        const unsignedFiles = fs.readdirSync(unsignedDir)
            .filter(f => f.startsWith(identifier) && f.endsWith('.xml'));
        if (unsignedFiles.length === 0) {
            logger.warn(`XML sin firmar no encontrado en ${unsignedDir} para identificador ${identifier}`);
        }
        unsignedFiles.forEach(f =>
            streams.push({
                key: 'unsigned',
                stream: fs.createReadStream(path.join(unsignedDir, f)),
                filename: f,
            }),
        );
    }
    existsFiles = [urlCrd, urlPdf, urlXmlSigned].every(isNonEmpty) && streams.length > 0;

    return {
        existsFiles,
        streams,
        urls: {
            urlCrd,
            urlPdf,
            urlXmlSigned,
        }
    };
}
