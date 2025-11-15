import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignEmployeeToCostCenter,
  removeEmployeeFromCostCenter,
  getEmployeeCostCenters,
  type EmployeeCostCenters,
} from "@/services/api/employees";
import { toast } from "sonner";

export function useEmployeeCostCenters(employeeId: string | null) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, ...queryRest } = useQuery<EmployeeCostCenters>({
    queryKey: ["employee-cost-centers", employeeId],
    queryFn: () => getEmployeeCostCenters(employeeId!),
    enabled: !!employeeId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const assignMutation = useMutation({
    mutationFn: ({ costCenterId }: { costCenterId: string }) =>
      assignEmployeeToCostCenter({
        employeeId: employeeId!,
        costCenterId,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employee-cost-centers", employeeId] });
      toast.success(data.message || "Empleado asignado correctamente");
    },
    onError: (error: any) => {
      if (error.status === 409) {
        toast.error("El empleado ya está asignado a este centro de costo");
      } else if (error.status === 404) {
        toast.error("El centro de costo no existe");
      } else {
        toast.error(error.message || "Error al asignar empleado");
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ costCenterId }: { costCenterId: string }) =>
      removeEmployeeFromCostCenter(employeeId!, costCenterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-cost-centers", employeeId] });
      toast.success("Asignación eliminada correctamente");
    },
    onError: (error: any) => {
      if (error.status === 404) {
        toast.error("La asignación no existe o ya fue eliminada");
      } else {
        toast.error(error.message || "Error al eliminar asignación");
      }
    },
  });

  return {
    costCenters: data?.costCenters ?? [],
    isLoading,
    assignCostCenter: (costCenterId: string) => assignMutation.mutate({ costCenterId }),
    removeCostCenter: (costCenterId: string) => removeMutation.mutate({ costCenterId }),
    assignMutation,
    removeMutation,
    ...queryRest,
  };
}
