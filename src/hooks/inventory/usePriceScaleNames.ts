// src/hooks/inventory/usePriceScaleNames.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllPriceScaleNames,
  getActivePriceScaleNames,
  createPriceScaleName,
  updatePriceScaleName,
  deletePriceScaleName,
} from "@/services/api/priceScaleNames";
import type { PriceScaleName } from "@/services/api/priceScaleNames";

type UpsertPayload = { 
  id?: string
  name: string
  position: number
  active: boolean
};

export function usePriceScaleNames() {
  const qc = useQueryClient();

  // --- FETCH ALL ---
  const { data: priceScaleNames = [], ...queryRest } = useQuery<PriceScaleName[], Error>({
    queryKey: ["priceScaleNames"],
    queryFn: getAllPriceScaleNames,
    staleTime: 1000 * 60 * 5,
  });

  // --- FETCH ACTIVE ---
  const { data: activePriceScaleNames = [] } = useQuery<PriceScaleName[], Error>({
    queryKey: ["priceScaleNames", "active"],
    queryFn: getActivePriceScaleNames,
    staleTime: 1000 * 60 * 5,
  });

  // --- CREATE ---
  const create = useMutation<PriceScaleName, Error, { name: string; position: number; active: boolean }>({
    mutationFn: (payload) => createPriceScaleName(payload),
    onSuccess: (newItem) => {
      qc.setQueryData<PriceScaleName[]>(["priceScaleNames"], (old = []) => 
        [...old, newItem].sort((a, b) => a.position - b.position)
      );
      qc.invalidateQueries({ queryKey: ["priceScaleNames", "active"] });
    },
  });

  // --- UPDATE ---
  const update = useMutation<PriceScaleName, Error, { id: string; name: string; position: number; active: boolean }>({
    mutationFn: ({ id, name, position, active }) => updatePriceScaleName(id, { name, position, active }),
    onSuccess: (updatedItem) => {
      qc.setQueryData<PriceScaleName[]>(["priceScaleNames"], (old = []) =>
        old.map((item) => (item.id === updatedItem.id ? updatedItem : item)).sort((a, b) => a.position - b.position)
      );
      qc.invalidateQueries({ queryKey: ["priceScaleNames", "active"] });
    },
  });

  // --- DELETE ---
  const remove = useMutation<boolean, Error, string>({
    mutationFn: (id) => deletePriceScaleName(id),
    onSuccess: (_data, id) => {
      qc.setQueryData<PriceScaleName[]>(["priceScaleNames"], (old = []) => old.filter((item) => item.id !== id));
      qc.invalidateQueries({ queryKey: ["priceScaleNames", "active"] });
    },
  });

  // --- UPSERT ---
  const setPriceScaleName = (payload: UpsertPayload) => {
    if (payload.id) {
      return update.mutate({ 
        id: payload.id, 
        name: payload.name, 
        position: payload.position, 
        active: payload.active 
      });
    }
    return create.mutate({ 
      name: payload.name, 
      position: payload.position, 
      active: payload.active 
    });
  };

  return {
    priceScaleNames,
    activePriceScaleNames,
    setPriceScaleName,
    remove,
    ...queryRest,
  };
}
