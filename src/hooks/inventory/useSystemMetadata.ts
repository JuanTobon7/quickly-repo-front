// src/hooks/inventory/useSystemMetadata.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSystemMetadata,
  updateSystemMetadata,
  UpdateSystemMetadataPayload,
} from "@/services/api/systemMetadata";

const SYSTEM_METADATA_KEY = "systemMetadata";

export function useSystemMetadata() {
  const queryClient = useQueryClient();

  // ✅ Obtener configuración del sistema
  const { data: systemMetadata, isLoading, error } = useQuery({
    queryKey: [SYSTEM_METADATA_KEY],
    queryFn: getSystemMetadata,
  });

  // ✅ Actualizar configuración del sistema
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSystemMetadataPayload }) =>
      updateSystemMetadata(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SYSTEM_METADATA_KEY] });
    },
  });

  return {
    systemMetadata,
    isLoading,
    error,
    updateSystemMetadata: (id: string, payload: UpdateSystemMetadataPayload) =>
      updateMutation.mutateAsync({ id, payload }),
  };
}
