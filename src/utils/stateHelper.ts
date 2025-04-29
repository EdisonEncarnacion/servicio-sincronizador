
import { DocRow } from '../types/document.interface';

export type FinalState =
    | 'ACEPTADO'
    | 'ACEPTADO_POR_REGULARIZACION'
    | 'RECHAZADO'
    | 'PENDIENTE';

/**
 * Determina el estado final de un documento combinando:
 *  - soap_shipping_response
 *  - response_regularize_shipping
 *  - state_type_id (fallback)
 */
export function determineFinalState(doc: DocRow): FinalState {
    if (doc.soap_shipping_response) {
        try {
            const rsp = JSON.parse(doc.soap_shipping_response);
            if (rsp.sent === true && rsp.code === '0') {
                return 'ACEPTADO';
            }
        } catch {
        }
    }

    if ((doc as any).response_regularize_shipping) {
        try {
            const reg = JSON.parse((doc as any).response_regularize_shipping);
            if (reg.code === '0') {
                return 'ACEPTADO_POR_REGULARIZACION';
            } else {
                return 'RECHAZADO';
            }
        } catch {
        }
    }

    switch (doc.state_type_id) {
        case '03': return 'ACEPTADO';
        case '09': return 'RECHAZADO';
        default: return 'PENDIENTE';
    }
}
