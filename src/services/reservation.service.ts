import { ReservationDatasource } from '../datasource/api/reservation-datasource';

export async function getPending(): Promise<any> {
  const reservations = await ReservationDatasource.listPendingReservations();
  return reservations.length>0? [reservations[0]] : [];
}
export async function confirmMigration(id: string): Promise<void> {
  await ReservationDatasource.confirmReservationMigration(id);
}
export async function addBankDoc(id: string, num: string): Promise<void> {
  await ReservationDatasource.addBankDocNumber(id, num);
}
export const ReservationService = {
  getPending,
  confirmMigration,
  addBankDoc
};
