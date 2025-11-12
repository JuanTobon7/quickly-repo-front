// src/hooks/useProductLines.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCategories,
  createProductLine,
  updateProductLine,
  deleteProductLine,
  ProductLine,
} from "@/services/api/productLines";

type UpsertPayload = { id?: string; name: string };

export function useProductLines() {
  const qc = useQueryClient();

  // --- FETCH ---
  const { data: productLines = [], ...queryRest } = useQuery<ProductLine[], Error>({
    queryKey: ["product-lines"],
    queryFn: getAllCategories,
    staleTime: 1000 * 60 * 5,
  });

  // --- CREATE ---
  const create = useMutation<ProductLine, Error, { name: string }>({
    mutationFn: (payload) => createProductLine(payload),
    onSuccess: (newLine) => {
      qc.setQueryData<ProductLine[]>(["product-lines"], (old = []) => [...old, newLine]);
    },
  });

  // --- UPDATE ---
  const update = useMutation<ProductLine, Error, { id: string; name: string }>({
    mutationFn: ({ id, name }) => updateProductLine(id, { name }),
    onSuccess: (updatedLine) => {
      qc.setQueryData<ProductLine[]>(["product-lines"], (old = []) =>
        old.map((line) => (line.id === updatedLine.id ? updatedLine : line))
      );
    },
  });

  // --- DELETE ---
  const remove = useMutation<boolean, Error, string>({
    mutationFn: (id) => deleteProductLine(id),
    onSuccess: (_data, id) => {
      qc.setQueryData<ProductLine[]>(["product-lines"], (old = []) =>
        old.filter((line) => line.id !== id)
      );
    },
  });

  // --- UPSERT ---
  const setProductLine = (payload: UpsertPayload) => {
    if (payload.id) return update.mutate({ id: payload.id, name: payload.name });
    return create.mutate({ name: payload.name });
  };

  return {
    productLines,
    setProductLine,
    remove,
    ...queryRest,
  };
}
