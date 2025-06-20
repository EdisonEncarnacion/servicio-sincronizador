import { Product } from "./product.interface";

export interface SaleNoteItem {
    id: number;
    sale_note_id: number;
    item_id: number;
    item: Product;
    quantity: number;
    unit_value: number;
    affectation_igv_type_id: string;
    total_base_igv: number;
    percentage_igv: number;
    total_igv: number;
    system_isc_type_id: string | null;
    total_base_isc: number;
    percentage_isc: number;
    total_isc: number;
    total_base_other_taxes: number;
    percentage_other_taxes: number;
    total_other_taxes: number;
    total_plastic_bag_taxes: number;
    total_taxes: number;
    price_type_id: string;
    unit_price: number;
    total_value: number;
    total_charge: number;
    total_discount: number;
    total: number;
    attributes: any[]; // puedes tiparlo si lo necesitas
    discounts: any[];
    charges: any[];
    additional_information: string | null;
    inventory_kardex_id: number;
    warehouse_id: number;
    name_product_pdf: string;
    modify_sale_unit_price: number;
}