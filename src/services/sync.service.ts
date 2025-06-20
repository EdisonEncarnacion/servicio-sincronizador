import { createDatabaseConnection } from "../config/db";
import { CustomerDatasource } from "../datasource/db/client-datasource";
import { productDatasource } from "../datasource/db/product-datasouce";
import { getSaleNotes } from "../datasource/db/sale-note.datasource";
import { logger } from "../utils/logger";
import { ReservationService } from "./reservation.service";


export async function sync() {
    const conn = await createDatabaseConnection();
    try {
        //const notes = await getSaleNotes(conn); 
        //const customers = await CustomerDatasource.getClients(conn);
        //const products= await productDatasource.getProducts(conn);
        //console.log(products)
        const reservations = await ReservationService.getPending()
        console.log(reservations)
    } catch (prepErr: any) {
        logger.error(`error preparación -> ${prepErr.message}`);
    } finally {
        await conn.end();
    }

}

