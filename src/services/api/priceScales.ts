// src/services/api/priceScales.ts
import { toast } from "sonner";
import api from "./client";

export type PriceScaleLevel = {
  id: string;
  position: number;
  name: string;
  profitPercentage: number;
};

export type PriceScale = {
  id: string;
  name: string;
  active: boolean;
  levels: PriceScaleLevel[];
};

export type CreatePriceScaleLevelPayload = {
  position: number;
  name: string;
  profitPercentage: number;
};

export type CreatePriceScalePayload = {
  name: string;
  active: boolean;
  levels: CreatePriceScaleLevelPayload[];
};

export type UpdatePriceScalePayload = CreatePriceScalePayload;

const baseUrl = "/inventory/price-scales";

// ✅ Obtener todas las escalas de precio
export async function getAllPriceScales(): Promise<PriceScale[]> {
  const response = await api.get(baseUrl);
  return response.data || [];
}

// ✅ Obtener la escala global única
export async function getGlobalPriceScale(): Promise<PriceScale> {
  const response = await api.get(`${baseUrl}/global`);
  return response.data;
}

// ✅ Obtener una escala de precio por id
export async function getPriceScaleById(id: string): Promise<PriceScale> {
  const response = await api.get(`${baseUrl}/${id}`);
  return response.data;
}

// ✅ Crear una escala de precio
export async function createPriceScale(payload: CreatePriceScalePayload): Promise<PriceScale> {
  const response = await api.post(baseUrl, payload);
  toast.success("Escala de precio creada correctamente");
  return response.data;
}

// ✅ Actualizar una escala de precio
export async function updatePriceScale(id: string, payload: UpdatePriceScalePayload): Promise<PriceScale> {
  const response = await api.put(`${baseUrl}/${id}`, payload);
  toast.success("Escala de precio actualizada correctamente");
  return response.data;
}

// ✅ Eliminar una escala de precio
export async function deletePriceScale(id: string): Promise<boolean> {
  await api.delete(`${baseUrl}/${id}`);
  toast.success("Escala de precio eliminada correctamente");
  return true;
}
