import { useQuery } from "@tanstack/react-query";
import { getAllCostCenters, type CostCenter } from "@/services/api/costCenters";

type UseCostCentersOptions = {
  enabled?: boolean;
};

export function useCostCenters(options: UseCostCentersOptions = {}) {
  const { enabled = true } = options;
  
  const { data, isLoading, error, ...queryRest } = useQuery<CostCenter[]>({
    queryKey: ["cost-centers"],
    queryFn: getAllCostCenters,
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    costCenters: data ?? [],
    isLoading,
    error,
    ...queryRest,
  };
}
