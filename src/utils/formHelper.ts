import FormData from 'form-data';
import { FileStream } from './fileHelper';

export function appendDocumentAttachments(
    form: FormData,
    streams: FileStream[]
): void {
    // PDF (único)
    const pdf = streams.find(s => s.key === 'pdf');
    if (pdf) {
        console.log(`Appending PDF: ${pdf.filename}`);
        form.append('pdf', pdf.stream, { filename: pdf.filename });
    } else {
        console.log('No PDF to append.');
    }
    // CDR (puede haber varios: R- y/o RA-)
    const cdrs = streams.filter(s => s.key === 'cdr');
   /*  if (cdrs.length > 0) {
        console.log(`Appending ${cdrs.length} CDR file(s):`, cdrs.map(c => c.filename));
    } else {
        console.log('No CDR files to append.');
    }
    cdrs.forEach((cdr, idx) => {
        form.append(`cdr${idx + 1}`, cdr.stream, { filename: cdr.filename });
    }); */

    if (cdrs.length > 0) {
        const unicoCdr = cdrs[0];
        console.log(`Appending single CDR: ${unicoCdr.filename}`);
        form.append('cdr', unicoCdr.stream, { filename: unicoCdr.filename });
      } else {
        console.log('No CDR files to append.');
      }

    // XML firmado
    const signed = streams.find(s => s.key === 'signed');
    if (signed) {
        console.log(`Appending signed XML: ${signed.filename}`);
        form.append('xml', signed.stream, { filename: signed.filename });
    } else {
        console.log('No signed XML to append.');
    }
/* 
    // XML sin firmar
    const unsigned = streams.find(s => s.key === 'unsigned');
    if (unsigned) {
        console.log(`Appending unsigned XML: ${unsigned.filename}`);
        form.append('unsigned', unsigned.stream, { filename: unsigned.filename });
    } else {
        console.log('No unsigned XML to append.');
    } */
}
