import { toast } from "sonner";
import api from "./client";

export interface GroupType {
  id: string;
  name: string;
}

const endpoint = '/inventory/group-type';

export async function getAllGroupTypes(): Promise<GroupType[]> {
  const response = await api.get<GroupType[]>(endpoint);
  return response.data;
}

export async function getGroupTypeById(id: string): Promise<GroupType> {
  const response = await api.get<GroupType>(`${endpoint}/${id}`);
  return response.data;
}

export async function createGroupType(data: { name: string }): Promise<GroupType> {
  const response = await api.post<GroupType>(endpoint, data);
  toast.success('Grupo cargado correctamente');
  return response.data;
}

export async function updateGroupType(id: string, data: { name: string }): Promise<GroupType> {
  const response = await api.put<GroupType>(`${endpoint}/${id}`, data);
  toast.success('Grupo actualizado correctamente');
  return response.data;
}

export async function deleteGroupType(id: string): Promise<void> {
  await api.delete(`${endpoint}/${id}`);
  toast.success('Grupo eliminado correctamente');

}
