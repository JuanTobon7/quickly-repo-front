import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAllTaxes,
  getTaxById,
  createTax,
  updateTax,
  deleteTax,
  Tax,
  CreateTaxPayload,
} from '@/services/api/taxes';

export function useTaxes() {
  const queryClient = useQueryClient();

  const { data: taxes = [], isLoading } = useQuery({
    queryKey: ['taxes'],
    queryFn: getAllTaxes,
  });

  const createMutation = useMutation({
    mutationFn: createTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast.success('Impuesto creado correctamente');
    },
    onError: () => {
      toast.error('Error al crear impuesto');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateTaxPayload }) =>
      updateTax(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast.success('Impuesto actualizado correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar impuesto');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast.success('Impuesto eliminado correctamente');
    },
    onError: () => {
      toast.error('Error al eliminar impuesto');
    },
  });

  return {
    taxes,
    isLoading,
    createTax: createMutation.mutate,
    updateTax: updateMutation.mutate,
    deleteTax: deleteMutation.mutate,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

export function useTaxById(id: string | undefined) {
  return useQuery({
    queryKey: ['tax', id],
    queryFn: () => getTaxById(id!),
    enabled: !!id,
  });
}
