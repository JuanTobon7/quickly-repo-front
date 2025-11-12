// src/services/api/systemMetadata.ts
import api from './client';
import { ApiResponse } from './client';

export interface SystemMetadata {
  id: string;
  minimumProfitPercentage: number;
  roundingValue: number;
  roundingEnabled: boolean;
}

export interface UpdateSystemMetadataPayload {
  minimumProfitPercentage: number;
  roundingValue: number;
  roundingEnabled: boolean;
}

/**
 * Obtener la configuración del sistema
 */
export const getSystemMetadata = async (): Promise<SystemMetadata> => {
  const response: any = await api.get('/inventory/system-metadata');
  return response.data;
};

/**
 * Actualizar la configuración del sistema
 */
export const updateSystemMetadata = async (
  id: string,
  payload: UpdateSystemMetadataPayload
): Promise<SystemMetadata> => {
  const response: any = await api.put(`/inventory/system-metadata/${id}`, payload);
  return response.data;
};
