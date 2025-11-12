// src/hooks/inventory/useBrands.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/services/api/brands";
import type { Brand } from "@/services/api/brands";

type UpsertPayload = { id?: string; name: string };

export function useBrands() {
  const qc = useQueryClient();

  // --- FETCH ---
  const { data: brands = [], ...queryRest } = useQuery<Brand[], Error>({
    queryKey: ["brands"],
    queryFn: getAllBrands,
    staleTime: 1000 * 60 * 5,
  });

  // --- CREATE ---
  const create = useMutation<Brand, Error, { name: string }>({
    mutationFn: (payload) => createBrand(payload),
    onSuccess: (newBrand) => {
      qc.setQueryData<Brand[]>(["brands"], (old = []) => [...old, newBrand]);
    },
  });

  // --- UPDATE ---
  const update = useMutation<Brand, Error, { id: string; name: string }>({
    mutationFn: ({ id, name }) => updateBrand(id, { name }),
    onSuccess: (updatedBrand) => {
      qc.setQueryData<Brand[]>(["brands"], (old = []) =>
        old.map((b) => (b.id === updatedBrand.id ? updatedBrand : b))
      );
    },
  });

  // --- DELETE ---
  const remove = useMutation<boolean, Error, string>({
    mutationFn: (id) => deleteBrand(id),
    onSuccess: (_data, id) => {
      qc.setQueryData<Brand[]>(["brands"], (old = []) => old.filter((b) => b.id !== id));
    },
  });

  // --- UPSERT ---
  const setBrand = (payload: UpsertPayload) => {
    if (payload.id) return update.mutate({ id: payload.id, name: payload.name });
    return create.mutate({ name: payload.name });
  };

  return {
    brands,
    setBrand,
    remove,
    ...queryRest,
  };
}
