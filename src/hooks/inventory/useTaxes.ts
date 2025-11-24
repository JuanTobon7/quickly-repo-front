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
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateTaxPayload }) =>
      updateTax(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast.success('Impuesto actualizado correctamente');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast.success('Impuesto eliminado correctamente');
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
