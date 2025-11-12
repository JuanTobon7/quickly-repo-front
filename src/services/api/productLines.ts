// src/services/api/ProductLine.ts
import { toast } from "sonner";
import api from "./client";

export type ProductLine = {
  id: string;
  name: string;
};

const baseUrl = "/inventory/product-lines";

export async function getAllCategories(): Promise<ProductLine[]> {
  const { data } = await api.get<ProductLine[]>(baseUrl);
  return data;
}

export async function createProductLine(payload: { name: string }): Promise<ProductLine> {
  const { data } = await api.post<ProductLine>(baseUrl, payload);
  toast.success('Linea cargada correctamente');
  return data;
}

export async function updateProductLine(id: string, payload: { name: string }): Promise<ProductLine> {
  const { data } = await api.put<ProductLine>(`${baseUrl}/${id}`, payload);
  toast.success('Linea actualizada correctamente');

  return data;
}

export async function deleteProductLine(id: string): Promise<boolean> {
  await api.delete(`${baseUrl}/${id}`);
  toast.success('Linea eliminada correctamente');
  return true;
}
