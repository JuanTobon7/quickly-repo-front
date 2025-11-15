import api from "./client";

export type SalePrice = {
  id: string;
  productId: string;
  priceAfterTaxes: number;
  priceBeforeTaxes: number;
};

export type CreateSalePricePayload = {
  productId: string;
  priceAfterTaxes: number;
  priceBeforeTaxes: number;
};

export type PriceTax = {
  id: string;
  priceId: string;
  taxId: string;
};

export type CreatePriceTaxPayload = {
  taxId: string;
};

const baseUrl = "/inventory/sale-prices";

/**
 * Get all sale prices
 */
export async function getAllSalePrices(): Promise<SalePrice[]> {
  const response = await api.get(baseUrl);
  return response.data || [];
}

/**
 * Get sale price by ID
 */
export async function getSalePriceById(id: string): Promise<SalePrice> {
  const response = await api.get(`${baseUrl}/${id}`);
  return response.data;
}

/**
 * Create a new sale price
 */
export async function createSalePrice(payload: CreateSalePricePayload): Promise<SalePrice> {
  const response = await api.post(baseUrl, payload);
  return response.data;
}

/**
 * Update a sale price
 */
export async function updateSalePrice(id: string, payload: CreateSalePricePayload): Promise<SalePrice> {
  const response = await api.put(`${baseUrl}/${id}`, payload);
  return response.data;
}

/**
 * Delete a sale price
 */
export async function deleteSalePrice(id: string): Promise<void> {
  await api.delete(`${baseUrl}/${id}`);
}

/**
 * Associate a tax to a sale price
 */
export async function associateTaxToPrice(priceId: string, payload: CreatePriceTaxPayload): Promise<PriceTax> {
  const response = await api.post(`${baseUrl}/${priceId}/taxes`, payload);
  return response.data;
}

/**
 * Get taxes associated with a sale price
 */
export async function getPriceTaxes(priceId: string): Promise<PriceTax[]> {
  const response = await api.get(`${baseUrl}/${priceId}/taxes`);
  return response.data || [];
}
