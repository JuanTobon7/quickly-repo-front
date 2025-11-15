import api from "./client";

export type Tax = {
  id: string;
  name: string;
  rate: number;
  forSales: boolean;
  forPurchases: boolean;
};

export type CreateTaxPayload = {
  name: string;
  rate: number;
  forSales: boolean;
  forPurchases: boolean;
};

const baseUrl = "/inventory/taxes";

/**
 * Get all taxes
 */
export async function getAllTaxes(): Promise<Tax[]> {
  const response = await api.get(baseUrl);
  return response.data || [];
}

/**
 * Get tax by ID
 */
export async function getTaxById(id: string): Promise<Tax> {
  const response = await api.get(`${baseUrl}/${id}`);
  return response.data;
}

/**
 * Create a new tax
 */
export async function createTax(payload: CreateTaxPayload): Promise<Tax> {
  const response = await api.post(baseUrl, payload);
  return response.data;
}

/**
 * Update a tax
 */
export async function updateTax(id: string, payload: CreateTaxPayload): Promise<Tax> {
  const response = await api.put(`${baseUrl}/${id}`, payload);
  return response.data;
}

/**
 * Delete a tax
 */
export async function deleteTax(id: string): Promise<void> {
  await api.delete(`${baseUrl}/${id}`);
}
