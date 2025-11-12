// src/hooks/useGroupTypes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllGroupTypes,
  createGroupType,
  updateGroupType,
  deleteGroupType,
} from "@/services/api/groupType";
import type { GroupType } from "@/services/api/groupType";

type UpsertPayload = { id?: string; name: string };

export function useGroupTypes() {
  const qc = useQueryClient();

  // --- FETCH ---
  const { data: groupTypes = [], ...queryRest } = useQuery<GroupType[], Error>({
    queryKey: ["group-types"],
    queryFn: getAllGroupTypes,
    staleTime: 1000 * 60 * 5,
  });

  // --- CREATE ---
  const create = useMutation<GroupType, Error, { name: string }>({
    mutationFn: (payload) => createGroupType(payload),
    onSuccess: (newGroup) => {
      qc.setQueryData<GroupType[]>(["group-types"], (old = []) => [...old, newGroup]);
    },
  });

  // --- UPDATE ---
  const update = useMutation<GroupType, Error, { id: string; name: string }>({
    mutationFn: ({ id, name }) => updateGroupType(id, { name }),
    onSuccess: (updatedGroup) => {
      qc.setQueryData<GroupType[]>(["group-types"], (old = []) =>
        old.map((grp) => (grp.id === updatedGroup.id ? updatedGroup : grp))
      );
    },
  });

  // --- DELETE ---
  const remove = useMutation<void, Error, string>({
    mutationFn: (id) => deleteGroupType(id),
    onSuccess: (_data, id) => {
      qc.setQueryData<GroupType[]>(["group-types"], (old = []) =>
        old.filter((grp) => grp.id !== id)
      );
    },
  });

  // --- UPSERT ---
  const setGroupType = (payload: UpsertPayload) => {
    if (payload.id) return update.mutate({ id: payload.id, name: payload.name });
    return create.mutate({ name: payload.name });
  };

  return {
    groupTypes,
    setGroupType,
    remove,
    ...queryRest,
  };
}
