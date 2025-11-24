import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  uploadProductImage,
  getProductImages,
  deleteProductImage,
  setMainProductImage,
  ProductImage,
} from '@/services/api/productImages';

export function useProductImages(productId?: string) {
  const queryClient = useQueryClient();

  // Query to fetch product images
  const {
    data: images = [],
    isLoading,
    error,
  } = useQuery<ProductImage[]>({
    queryKey: ['productImages', productId],
    queryFn: () => getProductImages(productId!),
    enabled: !!productId,
    retry: false,
  });

  // Mutation to upload image
  const uploadMutation = useMutation({
    mutationFn: ({ file, isMainImage }: { file: File; isMainImage: boolean }) =>
      uploadProductImage(productId!, file, isMainImage),
    onSuccess: (data) => {
      toast.success('Imagen subida correctamente');
      queryClient.invalidateQueries({ queryKey: ['productImages', productId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al subir la imagen');
    },
  });

  // Mutation to delete image
  const deleteMutation = useMutation({
    mutationFn: (imageId: string) => deleteProductImage(productId!, imageId),
    onSuccess: () => {
      toast.success('Imagen eliminada correctamente');
      queryClient.invalidateQueries({ queryKey: ['productImages', productId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar la imagen');
    },
  });

  // Mutation to set main image
  const setMainMutation = useMutation({
    mutationFn: (imageId: string) => setMainProductImage(productId!, imageId),
    onSuccess: () => {
      toast.success('Imagen marcada como principal');
      queryClient.invalidateQueries({ queryKey: ['productImages', productId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al marcar como principal');
    },
  });

  const mainImage = images.find((img) => img.mainImage);

  return {
    images,
    mainImage,
    isLoading,
    error,
    uploadImage: uploadMutation.mutateAsync,
    deleteImage: deleteMutation.mutateAsync,
    setMainImage: setMainMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSettingMain: setMainMutation.isPending,
  };
}
