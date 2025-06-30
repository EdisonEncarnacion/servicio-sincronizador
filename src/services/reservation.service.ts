export async function getPending(): Promise<any[]> {
  // Devuelve un arreglo vacío por ahora (ya no usamos la API)
  return [];
}

export async function confirmMigration(id: string): Promise<void> {
  // Este método ya no hace nada
  return;
}

export async function addBankDoc(id: string, num: string): Promise<void> {
  // Este método ya no hace nada
  return;
}

export const ReservationService = {
  getPending,
  confirmMigration,
  addBankDoc,
};
