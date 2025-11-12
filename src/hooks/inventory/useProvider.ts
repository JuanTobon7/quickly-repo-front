// src/hooks/useProviders.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllProviders,
  createProvider,
  updateProvider,
  deleteProvider,
} from "@/services/api/provider";
import type { providerType as Provider } from "@/types/providers";

type UpsertPayload = {
  id?: string;
  name: string;
  contact?: string;
};

export function useProviders() {
  const qc = useQueryClient();

  // --- FETCH ---
  const { data: providers = [], ...queryRest } = useQuery<Provider[], Error>({
    queryKey: ["providers"],
    queryFn: getAllProviders,
    staleTime: 1000 * 60 * 5,
  });

  // --- CREATE ---
  const create = useMutation<Provider, Error, { name: string; contact?: string }>({
    mutationFn: (payload) => createProvider(payload),
    onSuccess: (newProvider) => {
      qc.setQueryData<Provider[]>(["providers"], (old = []) => [...old, newProvider]);
    },
  });

  // --- UPDATE ---
  const update = useMutation<
    Provider,
    Error,
    { id: string; name: string; contact?: string }
  >({
    mutationFn: ({ id, name, contact }) => updateProvider(id, { name, contact }),
    onSuccess: (updatedProvider) => {
      qc.setQueryData<Provider[]>(["providers"], (old = []) =>
        old.map((prov) => (prov.id === updatedProvider.id ? updatedProvider : prov))
      );
    },
  });

  // --- DELETE ---
  const remove = useMutation<boolean, Error, string>({
    mutationFn: (id) => deleteProvider(id),
    onSuccess: (_data, id) => {
      qc.setQueryData<Provider[]>(["providers"], (old = []) =>
        old.filter((prov) => prov.id !== id)
      );
    },
  });

  // --- UPSERT ---
  const setProvider = (payload: UpsertPayload) => {
    if (payload.id)
      return update.mutate({ id: payload.id, name: payload.name, contact: payload.contact });
    return create.mutate({ name: payload.name, contact: payload.contact });
  };

  return {
    providers,
    setProvider,
    remove,
    ...queryRest,
  };
}
