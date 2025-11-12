// src/services/api/brand.ts
import { toast } from "sonner"
import api from "./client"

export type Brand = {
  id: string
  name: string
}

const baseUrl = "/inventory/brands"

// ✅ Obtener todas las marcas
export async function getAllBrands(): Promise<Brand[]> {
  const { data } = await api.get<Brand[]>(baseUrl)
  return data
}

// ✅ Crear una nueva marca
export async function createBrand(payload: { name: string }): Promise<Brand> {
  const { data } = await api.post<Brand>(baseUrl, payload)
  toast.success('Marca cargada correctamente');
  return data
}

// ✅ Actualizar una marca
export async function updateBrand(id: string, payload: { name: string }): Promise<Brand> {
  const { data } = await api.put<Brand>(`${baseUrl}/${id}`, payload)
  toast.success('Marca actualizada correctamente');
  return data
}

// ✅ Eliminar una marca
export async function deleteBrand(id: string): Promise<boolean> {
  await api.delete(`${baseUrl}/${id}`)
  toast.success('Marca eliminada correctamente');
  return true
}
