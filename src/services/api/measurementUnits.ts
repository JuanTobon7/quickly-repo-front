import api from "./client";

export type Measurement = {
  id: string;
  name: string;
};

const baseUrl = "/inventory/measure";

export async function getAllMeasurementUnits(): Promise<Measurement[]> {
  const { data } = await api.get<Measurement[]>(baseUrl);
  return data;
}

export async function createMeasurementUnit(payload: { name: string }): Promise<Measurement> {
  const { data } = await api.post<Measurement>(baseUrl, payload);
  return data;
}

export async function updateMeasurementUnit(id: string, payload: { name: string }): Promise<Measurement> {
  const { data } = await api.put<Measurement>(`${baseUrl}/${id}`, payload);
  return data;
}

export async function deleteMeasurementUnit(id: string): Promise<boolean> {
  await api.delete(`${baseUrl}/${id}`);
  return true;
}
