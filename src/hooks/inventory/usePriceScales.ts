// src/hooks/inventory/usePriceScales.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllPriceScales,
  getGlobalPriceScale,
  getPriceScaleById,
  createPriceScale,
  updatePriceScale,
  deletePriceScale,
  CreatePriceScalePayload,
  UpdatePriceScalePayload,
} from "@/services/api/priceScales";

const PRICE_SCALES_KEY = "priceScales";
const GLOBAL_PRICE_SCALE_KEY = "globalPriceScale";

export function usePriceScales() {
  const queryClient = useQueryClient();

  // ✅ Obtener todas las escalas de precio
  const { data: priceScales = [], isLoading, error } = useQuery({
    queryKey: [PRICE_SCALES_KEY],
    queryFn: getAllPriceScales,
  });

  // ✅ Obtener la escala global única
  const { data: globalScale, isLoading: isLoadingGlobal } = useQuery({
    queryKey: [GLOBAL_PRICE_SCALE_KEY],
    queryFn: getGlobalPriceScale,
  });

  // ✅ Crear escala de precio
  const createMutation = useMutation({
    mutationFn: createPriceScale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRICE_SCALES_KEY] });
      queryClient.invalidateQueries({ queryKey: [GLOBAL_PRICE_SCALE_KEY] });
    },
  });

  // ✅ Actualizar escala de precio
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePriceScalePayload }) =>
      updatePriceScale(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRICE_SCALES_KEY] });
      queryClient.invalidateQueries({ queryKey: [GLOBAL_PRICE_SCALE_KEY] });
    },
  });

  // ✅ Eliminar escala de precio
  const deleteMutation = useMutation({
    mutationFn: deletePriceScale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRICE_SCALES_KEY] });
      queryClient.invalidateQueries({ queryKey: [GLOBAL_PRICE_SCALE_KEY] });
    },
  });

  return {
    priceScales,
    globalScale,
    isLoading,
    isLoadingGlobal,
    error,
    createPriceScale: createMutation.mutateAsync,
    updatePriceScale: (id: string, payload: UpdatePriceScalePayload) =>
      updateMutation.mutateAsync({ id, payload }),
    deletePriceScale: deleteMutation.mutateAsync,
  };
}

// ✅ Hook para obtener una escala específica por ID
export function usePriceScaleById(id: string | undefined) {
  return useQuery({
    queryKey: [PRICE_SCALES_KEY, id],
    queryFn: () => getPriceScaleById(id!),
    enabled: !!id,
  });
}
