import { toast } from "sonner";
import api from "./client";

export type Employee = {
  id: string;
  name: string;
  lastname: string;
  email: string;
  createdAt: string;
  costCenterIds: string[];
};

export type CostCenter = {
  id: string;
  name: string;
};

export type CostCenterAssignment = {
  employeeId: string;
  costCenterId: string;
  message?: string;
};

export type EmployeeCostCenters = {
  employeeId: string;
  costCenters: CostCenter[];
};

const baseUrl = "/inventory/cost-center-employees";

/**
 * Obtener todos los empleados desde el endpoint /employees
 */
export async function getAllEmployees(): Promise<Employee[]> {
  try {
    const { data } = await api.get<Employee[]>('/employees');
    
    // Asegurar que es un array y que costCenterIds existe en cada empleado
    const employees = Array.isArray(data) ? data : [];
    return employees.map(emp => ({
      ...emp,
      costCenterIds: emp.costCenterIds || []
    }));
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    // Si el endpoint falla, retornar array vacío
    // No mostrar toast de error aquí, se maneja en el componente
    return [];
  }
}

/**
 * Asignar empleado a centro de costo
 */
export async function assignEmployeeToCostCenter(
  payload: Omit<CostCenterAssignment, "message">
): Promise<CostCenterAssignment> {
  const { data } = await api.post(baseUrl, payload);
  // El backend devuelve directamente { employeeId, costCenterId, message }
  // sin wrapper ApiResponse
  return data;
}

/**
 * Eliminar asignación de empleado
 */
export async function removeEmployeeFromCostCenter(
  employeeId: string,
  costCenterId: string
): Promise<void> {
  await api.delete(`${baseUrl}/${employeeId}/${costCenterId}`);
}

/**
 * Obtener centros de costo de un empleado
 */
export async function getEmployeeCostCenters(
  employeeId: string
): Promise<EmployeeCostCenters> {
  const { data } = await api.get(`${baseUrl}/employee/${employeeId}`);
  // El backend devuelve directamente { employeeId, costCenters: [...] }
  // sin wrapper ApiResponse
  return data;
}

/**
 * Verificar si empleado está asignado a centro de costo
 */
export async function checkEmployeeAssignment(
  employeeId: string,
  costCenterId: string
): Promise<boolean> {
  const { data } = await api.get<boolean>(`${baseUrl}/check/${employeeId}/${costCenterId}`);
  return data;
}
