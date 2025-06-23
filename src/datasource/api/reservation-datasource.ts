import { PendingReservation } from "../../interfaces/api/api-reservas-response.interface";
import { request } from "../../utils/http/http-client";

const listPendingReservations = async (): Promise<PendingReservation[]> =>
  await request<PendingReservation[]>({
    method: 'GET',
    url: '/reservas/por-facturar',
  });
const confirmReservationMigration = async (
  id: string,
): Promise<void> =>
  await request<void>({
    method: 'PATCH',
    url: `/reservas/${id}/confirmar-migracion`,
  });

const addBankDocNumber = async (
  id: string,
  bankDocNumber: string,
): Promise<void> =>
  request<void>({
    method: 'POST',
    url: `/reservations/${id}/bank-doc`,
    data: { bankDocNumber },
  });

const addDocumentNumber = async (
  idReserva: string,
  numero: string | number,
): Promise<void> =>
  request<void>({
    method: 'POST',
    url: `/reservas/${idReserva}/agregar-numero-documento`,
    data: { numeroDocumento: numero },
  });

export const ReservationDatasource = {
  listPendingReservations,
  confirmReservationMigration,
  addBankDocNumber,
  addDocumentNumber,
};
