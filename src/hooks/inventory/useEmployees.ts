import { useQuery } from "@tanstack/react-query";
import { getAllEmployees, type Employee } from "@/services/api/employees";

type UseEmployeesOptions = {
  enabled?: boolean;
};

export function useEmployees(options: UseEmployeesOptions = {}) {
  const { enabled = true } = options;
  
  const { data, isLoading, error, ...queryRest } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: getAllEmployees,
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    employees: data ?? [],
    isLoading,
    error,
    ...queryRest,
  };
}
