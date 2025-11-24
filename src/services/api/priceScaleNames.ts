// src/services/api/priceScaleNames.ts
import { toast } from "sonner"
import api from "./client"

export type PriceScaleName = {
  id: string
  name: string
  position: number
  active: boolean
}

const baseUrl = "/inventory/price-scale-names"

// ✅ Obtener todas las escalas de precios
export async function getAllPriceScaleNames(): Promise<PriceScaleName[]> {
  const { data } = await api.get<PriceScaleName[]>(baseUrl)
  return data
}

// ✅ Obtener escalas de precios activas
export async function getActivePriceScaleNames(): Promise<PriceScaleName[]> {
  const { data } = await api.get<PriceScaleName[]>(`${baseUrl}/active`)
  return data
}

// ✅ Crear un nuevo nombre de escala
export async function createPriceScaleName(payload: { 
  name: string
  position: number
  active: boolean
}): Promise<PriceScaleName> {
  const { data } = await api.post<PriceScaleName>(baseUrl, payload)
  toast.success('Nivel de escala creado correctamente')
  return data
}

// ✅ Actualizar un nombre de escala
export async function updatePriceScaleName(
  id: string, 
  payload: { 
    name: string
    position: number
    active: boolean
  }
): Promise<PriceScaleName> {
  const { data } = await api.put<PriceScaleName>(`${baseUrl}/${id}`, payload)
  toast.success('Nivel de escala actualizado correctamente')
  return data
}

// ✅ Eliminar un nombre de escala
export async function deletePriceScaleName(id: string): Promise<boolean> {
  await api.delete(`${baseUrl}/${id}`)
  toast.success('Nivel de escala eliminado correctamente')
  return true
}
