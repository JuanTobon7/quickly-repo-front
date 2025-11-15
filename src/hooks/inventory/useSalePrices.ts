import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAllSalePrices,
  getSalePriceById,
  createSalePrice,
  updateSalePrice,
  deleteSalePrice,
  associateTaxToPrice,
  getPriceTaxes,
  SalePrice,
  CreateSalePricePayload,
  PriceTax,
  CreatePriceTaxPayload,
} from '@/services/api/salePrices';

export function useSalePrices() {
  const queryClient = useQueryClient();

  const { data: salePrices = [], isLoading } = useQuery({
    queryKey: ['salePrices'],
    queryFn: getAllSalePrices,
  });

  const createMutation = useMutation({
    mutationFn: createSalePrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salePrices'] });
      toast.success('Precio de venta creado correctamente');
    },
    onError: () => {
      toast.error('Error al crear precio de venta');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateSalePricePayload }) =>
      updateSalePrice(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salePrices'] });
      toast.success('Precio de venta actualizado correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar precio de venta');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSalePrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salePrices'] });
      toast.success('Precio de venta eliminado correctamente');
    },
    onError: () => {
      toast.error('Error al eliminar precio de venta');
    },
  });

  const associateTaxMutation = useMutation({
    mutationFn: ({ priceId, payload }: { priceId: string; payload: CreatePriceTaxPayload }) =>
      associateTaxToPrice(priceId, payload),
    onSuccess: () => {
      toast.success('Impuesto asociado correctamente');
    },
    onError: () => {
      toast.error('Error al asociar impuesto');
    },
  });

  return {
    salePrices,
    isLoading,
    createSalePrice: createMutation.mutate,
    updateSalePrice: updateMutation.mutate,
    deleteSalePrice: deleteMutation.mutate,
    associateTaxToPrice: associateTaxMutation.mutate,
    createMutation,
    updateMutation,
    deleteMutation,
    associateTaxMutation,
  };
}

export function useSalePriceById(id: string | undefined) {
  return useQuery({
    queryKey: ['salePrice', id],
    queryFn: () => getSalePriceById(id!),
    enabled: !!id,
  });
}

export function usePriceTaxes(priceId: string | undefined) {
  return useQuery({
    queryKey: ['priceTaxes', priceId],
    queryFn: () => getPriceTaxes(priceId!),
    enabled: !!priceId,
  });
}
