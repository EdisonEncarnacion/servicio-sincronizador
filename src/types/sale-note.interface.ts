export interface Country {
    id: string;
    description: string;
}

export interface Department {
    id: string;
    description: string;
}

export interface Province {
    id: string;
    description: string;
}

export interface District {
    id: string;
    description: string;
}

/* ────────── Establecimiento ────────── */

export interface Establishment {
    country_id: string;
    country: Country;
    department_id: string;
    department: Department;
    province_id: string;
    province: Province;
    district_id: string;
    district: District;
    urbanization: string | null;
    address: string;
    email: string;
    telephone: string;
    code: string;
    trade_address: string | null;
    web_address: string | null;
    aditional_information: string | null;
    logo: string | null;
}

/* ────────── Cliente ────────── */
export interface IdentityDocumentType {
    id: string;
    description: string;
}
export interface AddressType {
    id: string | null;
    description: string | null;
}
export interface Customer {
    location: string | null;
    identity_document_type_id: string;
    bank_name: string | null;
    bank_account_number: string | null;
    identity_document_type: IdentityDocumentType;
    number: string;
    name: string;
    trade_name: string | null;
    is_driver: boolean;
    country_id: string;
    country: Country;
    department_id: string;
    department: Department;
    province_id: string;
    province: Province;
    district_id: string;
    district: District;
    address: string;
    email: string | null;
    telephone: string | null;
    perception_agent: boolean;
    address_id: string;
    internal_id: string | null;
    internal_code: string | null;
    address_type_id: string | null;
    address_type: AddressType;
    search_telephone: string | null;
}
/* ────────── Registro principal ────────── */
export interface SaleDocument {
    /* IDs y relaciones */
    id: number;
    website_id: number | null;
    company: unknown | null;
    user_id: number;
    external_id: string;
    establishment_id: number;
    orden_id: number | null;
    establishment: Establishment;
    /* Cabecera */
    soap_type_id: string;
    state_type_id: string;
    prefix: string;
    series: string;
    number: number;
    date_of_issue: string; // 'YYYY-MM-DD'
    time_of_issue: string; // 'HH:mm:ss'
    /* Cliente */
    customer_id: number;
    customer: Customer;
    /* Monetario */
    currency_type_id: string;
    payment_condition_id: string;
    payment_method_type_id: string | null;
    exchange_rate_sale: number;
    /* Flags / sistemas de puntos */
    point_system: number;
    point_system_data: unknown | null;
    created_from_pos: number;
    apply_concurrency: number;
    enabled_concurrency: number;
    /* Programación automática */
    automatic_date_of_issue: string | null;
    quantity_period: number;
    type_period: string | null;
    /* Totales */
    total_prepayment: number;
    total_charge: number;
    total_discount: number;
    total_exportation: number;
    total_free: number;
    total_taxed: number;
    total_unaffected: number;
    total_exonerated: number;
    total_igv: number;
    total_igv_free: number;
    total_base_isc: number;
    total_isc: number;
    total_base_other_taxes: number;
    total_other_taxes: number;
    total_plastic_bag_taxes: number;
    total_taxes: number;
    total_value: number;
    subtotal: number;
    total: number;
    /* Opciones de despacho */
    dispatch_ticket_pdf: number;
    dispatch_ticket_pdf_quantity: number;
    /* Colecciones (vacías en el ejemplo) */
    charges: unknown[];
    discounts: unknown[];
    prepayments: unknown | null;
    guides: unknown[];
    related: unknown | null;
    perception: unknown | null;
    detraction: unknown | null;
    legends: unknown | null;
    /* Información adicional */
    additional_information: string;
    filename: string;
    unique_filename: string;

    /* Enlaces a otros módulos */
    quotation_id: number | null;
    order_note_id: number | null;
    technical_service_id: number | null;
    order_id: number | null;

    /* Estados de pago / cancelación */
    total_canceled: number;
    changed: number;
    paid: number;

    /* Datos misceláneos */
    license_plate: string | null;
    plate_number: string | null;
    reference_data: unknown | null;
    agent_id: number | null;
    observation: string | null;
    purchase_order: string | null;

    /* Suscripción, fechas, usuario */
    document_id: number;
    user_rel_suscription_plan_id: number;
    due_date: string | null;
    created_at: string; // 'YYYY-MM-DD HH:mm:ss'
    updated_at: string; // 'YYYY-MM-DD HH:mm:ss'

    /* Metadatos adicionales */
    seller_id: number;
    grade: string | null;
    section: string | null;
    terms_condition: string | null;
    cash_id: number;
    no_stock: number;
    state_payment_id: string;
    alter_company: unknown | null;
    optometry_service_id: number | null;
    person_dispatcher_id: number | null;
    person_packer_id: number | null;
    box: string | null;
    dispatcher_id: number | null;
    shipping_address: string | null;
}


