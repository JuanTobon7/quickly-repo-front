import { toast } from "sonner";
import api from "./client";

export interface UnitMeasure {
  id: string;
  name: string;
  abbreviation?: string; // opcional, por si querés mostrar "kg", "l", etc.
}

const endpoint = '/inventory/measure';

export async function getAllUnitMeasures(): Promise<UnitMeasure[]> {
  const response = await api.get<UnitMeasure[]>(endpoint);
  return response.data;
}

export async function getUnitMeasureById(id: string): Promise<UnitMeasure> {
  const response = await api.get<UnitMeasure>(`${endpoint}/${id}`);
  return response.data;
}

export async function createUnitMeasure(data: { name: string; abbreviation?: string }): Promise<UnitMeasure> {
  const response = await api.post<UnitMeasure>(endpoint, data);
  toast.success('Unidad de medida creada correctamente');
  return response.data;
}

export async function updateUnitMeasure(id: string, data: { name: string; abbreviation?: string }): Promise<UnitMeasure> {
  const response = await api.put<UnitMeasure>(`${endpoint}/${id}`, data);
  toast.success('Unidad de medida actualizada correctamente');
  return response.data;
}

export async function deleteUnitMeasure(id: string): Promise<void> {
  await api.delete(`${endpoint}/${id}`);
  toast.success('Unidad de medida eliminada correctamente');

}
