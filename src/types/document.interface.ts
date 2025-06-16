import { RowDataPacket } from 'mysql2';
export enum Estado {
    REGISTRADO = '01',
    ENVIADO = '03',
    ACEPTADO = '05',
    OBSERVADO = '07',
    RECHAZADO = '09',
    ANULADO = '11',
    POR_ANULAR = '13',
    INTERNO = '55',
}
export const EstadoDescripcion: Record<string, string> = {
    [Estado.ACEPTADO]: 'ACEPTADO',
    [Estado.ANULADO]: 'BAJA',
    [Estado.RECHAZADO]: 'RECHAZADO',
    [Estado.REGISTRADO]: 'Registrado',
    [Estado.ENVIADO]: 'Enviado',
    [Estado.OBSERVADO]: 'ERROR',
    [Estado.POR_ANULAR]: 'Por anular',
    [Estado.INTERNO]: 'Interno',
};
export enum Tipo {
    FACTURA = '01',
    BOLETA = '03',
    NOTA_CREDITO = '07',
    NOTA_DEBITO = '08',
    GUIA_REMISION = '09',
    RESUMEN_DIARIO = '10',
    COMPROBANTE_DE_PAGO_BOLIVIA = '11',
    COMPROBANTE_DE_PAGO_CHILE = '12',
    COMPROBANTE_DE_PAGO_COLOMBIA = '13'
}
export interface Customer {
    location: unknown | null;
    identity_document_type_id: string;
    bank_name: string | null;
    bank_account_number: string | null;
    identity_document_type: {
        id: string;
        description: string;
    };
    number: string;
    name: string;
    trade_name: string | null;
    is_driver: boolean;
    country_id: string;
    country: {
        id: string;
        description: string;
    };
    department_id: string;
    department: {
        id: string;
        description: string;
    };
    province_id: string;
    province: {
        id: string;
        description: string;
    };
    district_id: string;
    district: {
        id: string;
        description: string;
    };
    address: string;
    email: string | null;
    telephone: string | null;
    perception_agent: boolean;
    address_id: string | null;
    internal_id: string | null;
    internal_code: string | null;
    address_type_id: string | null;
    address_type: {
        id: string | null;
        description: string | null;
    };
    search_telephone: string | null;
}
export interface Document {
    id: number;
    website_id: number | null;
    company: string | null;
    user_id: number;
    external_id: string;
    establishment_id: number;
    establishment: string;
    soap_type_id: string;
    state_type_id: string;
    ubl_version: string;
    ticket_single_shipment: 0 | 1;
    force_send_by_summary: 0 | 1;
    group_id: string;
    document_type_id: string;
    series: string;
    number: number;
    date_of_issue: string;       // ISO date
    time_of_issue: string;       // HH:mm:ss
    customer_id: number;
    customer: Customer;
    currency_type_id: string;
    payment_condition_id: string | null;
    payment_method_type_id: string | null;
    purchase_order: string | null;
    plate_number: string | null;
    quotation_id: number | null;
    sale_note_id: number | null;
    user_rel_suscription_plan_id: number;
    technical_service_id: number | null;
    order_note_id: number | null;
    dispatch_id: number | null;
    seller_id: number | null;
    exchange_rate_sale: string;
    point_system: 0 | 1;
    point_system_data: string | null;
    automatic_date_of_issue: string | null;
    type_period: string | null;
    quantity_period: number | null;
    enabled_concurrency: number;
    apply_concurrency: number;
    total_prepayment: string;
    total_charge: string;
    total_discount: string;
    total_exportation: string;
    total_free: string;
    total_taxed: string;
    total_unaffected: string;
    total_exonerated: string;
    total_igv: string;
    total_igv_free: string;
    total_base_isc: string;
    total_isc: string;
    total_base_other_taxes: string;
    total_other_taxes: string;
    total_plastic_bag_taxes: string;
    total_taxes: string;
    total_value: string;
    subtotal: string;
    total: string;
    dispatch_ticket_pdf: number;
    dispatch_ticket_pdf_quantity: number;
    has_prepayment: 0 | 1;
    affectation_type_prepayment: string | null;
    was_deducted_prepayment: 0 | 1;
    pending_amount_prepayment: string;
    total_pending_payment: string;
    charges: string | null;
    discounts: string | null;
    prepayments: string | null;
    guides: string | null;
    related: string | null;
    perception: string | null;
    detraction: string | null;
    retention: string | null;
    legends: string | null;
    additional_information: string | null;
    additional_data: string | null;
    filename: string | null;
    unique_filename: string | null;
    hash: string | null;
    reference_data: string | null;
    agent_id: number | null;
    has_xml: 0 | 1;
    has_pdf: 0 | 1;
    has_cdr: 0 | 1;
    data_json: string | null;
    send_server: 0 | 1;
    success_shipping_status: 0 | 1;
    shipping_status: string | null;
    success_sunat_shipping_status: 0 | 1;
    sunat_shipping_status: string | null;
    query_status: string | null;
    success_query_status: 0 | 1;
    total_canceled: 0 | 1;
    soap_shipping_response: string | null;
    regularize_shipping: 0 | 1;
    response_regularize_shipping: string | null;
    send_to_pse: 0 | 1;
    response_signature_pse: string | null;
    response_send_cdr_pse: string | null;
    sale_notes_relateds: string | null;
    terms_condition: string | null;
    folio: string | null;
    created_at: string | null;   // or Date
    updated_at: string | null;   // or Date
    is_editable: 0 | 1;
    grade: string | null;
    section: string | null;
    orden_id: number | null;
    quotations_optional: string | null;
    quotations_optional_value: string | null;
    auditor_state: number;
    appendix_2: number;
    appendix_3: number;
    appendix_4: number;
    appendix_5: number;
    cash_id: number | null;
    no_stock: 0 | 1;
    bill_of_exchange_id: number | null;
    alter_company: string | null;
    sent_it_email: 0 | 1;
    optometry_service_id: number | null;
    person_dispatcher_id: number | null;
    person_packer_id: number | null;
    box: string | null;
    dispatcher_id: number | null;
    split_code: string | null;
    attempt_pse: number;
    state_validate: string | null;
    date_validate: string | null;
    validate_attemps: number;
    migrated_file: 0 | 1;
    migrated: 0 | 1;
    migrated_at?: string | null;
    migrated_updated_at?: string | null;
    migrated_status_code?: string | null;
    migrated_document_id?: string | null;
}
export type DocRow = Document & RowDataPacket;
