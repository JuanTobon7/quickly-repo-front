// src/hooks/inventory/useMeasurementUnits.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllMeasurementUnits,
  createMeasurementUnit,
  updateMeasurementUnit,
  deleteMeasurementUnit,
} from "@/services/api/measurementUnits";
import type { MeasurementUnit } from "@/services/api/measurementUnits";

type UpsertPayload = { id?: string; name: string };

export function useMeasurementUnits() {
  const qc = useQueryClient();

  // --- FETCH ---
  const { data: measurementUnits = [], ...queryRest } = useQuery<MeasurementUnit[], Error>({
    queryKey: ["measurement-units"],
    queryFn: getAllMeasurementUnits,
    staleTime: 1000 * 60 * 5,
  });

  // --- CREATE ---
  const create = useMutation<MeasurementUnit, Error, { name: string }>({
    mutationFn: (payload) => createMeasurementUnit(payload),
    onSuccess: (newUnit) => {
      qc.setQueryData<MeasurementUnit[]>(["measurement-units"], (old = []) => [...old, newUnit]);
    },
  });

  // --- UPDATE ---
  const update = useMutation<MeasurementUnit, Error, { id: string; name: string }>({
    mutationFn: ({ id, name }) => updateMeasurementUnit(id, { name }),
    onSuccess: (updatedUnit) => {
      qc.setQueryData<MeasurementUnit[]>(["measurement-units"], (old = []) =>
        old.map((unit) => (unit.id === updatedUnit.id ? updatedUnit : unit))
      );
    },
  });

  // --- DELETE ---
  const remove = useMutation<boolean, Error, string>({
    mutationFn: (id) => deleteMeasurementUnit(id),
    onSuccess: (_data, id) => {
      qc.setQueryData<MeasurementUnit[]>(["measurement-units"], (old = []) =>
        old.filter((unit) => unit.id !== id)
      );
    },
  });

  // --- UPSERT ---
  const setMeasurementUnit = (payload: UpsertPayload) => {
    if (payload.id) return update.mutate({ id: payload.id, name: payload.name });
    return create.mutate({ name: payload.name });
  };

  return {
    measurementUnits,
    setMeasurementUnit,
    remove,
    ...queryRest,
  };
}
