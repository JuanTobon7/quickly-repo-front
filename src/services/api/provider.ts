import { toast } from "sonner";
import api from "./client";
import type { providerType } from "@/types/providers";

export async function getAllProviders(): Promise<providerType[]> {
  const { data } = await api.get<providerType[]>('/inventory/providers')
  return data
}

export async function createProvider(payload: { name: string; contact?: string }): Promise<providerType> {
  const { data } = await api.post<providerType>('/inventory/providers', payload)
  toast.success('Proveedor cargado correctamente');
  return data
}

export async function updateProvider(id: string, payload: { name: string; contact?: string }): Promise<providerType> {
  const { data } = await api.put<providerType>(`/inventory/providers/${id}`, payload)
  toast.success('Proveedor actualizado correctamente');

  return data
}

export async function deleteProvider(id: string): Promise<boolean> {
  await api.delete(`/inventory/providers/${id}`)
  toast.success('Proveedor eliminado correctamente');
  return true
}