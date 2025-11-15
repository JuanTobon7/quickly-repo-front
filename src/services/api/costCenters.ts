import api from "./client";

export type CostCenter = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
};

const baseUrl = "/inventory/costCenters";

/**
 * Obtener todos los centros de costo
 */
export async function getAllCostCenters(): Promise<CostCenter[]> {
  const { data } = await api.get(baseUrl);
  // El backend devuelve { status: "success", message: "OK", data: [...] }
  // Como el interceptor no detecta esto como ApiResponse (usa success: boolean)
  // data ya contiene el array de centros de costo
  if (Array.isArray(data)) {
    return data;
  }
  // Si viene en data.data debido al interceptor
  return (data as any)?.data || [];
}

/**
 * Obtener centro de costo por ID
 */
export async function getCostCenterById(id: string): Promise<CostCenter> {
  const { data } = await api.get(`${baseUrl}/${id}`);
  // Si viene en data.data debido al interceptor
  return (data as any)?.data || data;
}
