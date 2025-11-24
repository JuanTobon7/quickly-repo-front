import React from 'react';
import { Trash2, Star, Loader2 } from 'lucide-react';
import { useProductImages } from '@/hooks/inventory/useProductImages';

type ProductImageGalleryProps = {
  productId: string;
};

/**
 * Component to display and manage multiple product images
 * Allows uploading, deleting, and setting main image
 */
export function ProductImageGallery({ productId }: ProductImageGalleryProps) {
  const {
    images,
    mainImage,
    isLoading,
    uploadImage,
    deleteImage,
    setMainImage,
    isUploading,
    isDeleting,
  } = useProductImages(productId);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadImage({ file, isMainImage: images.length === 0 });
      event.target.value = ''; // Reset input
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('¿Está seguro de eliminar esta imagen?')) return;
    
    try {
      await deleteImage(imageId);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleSetMain = async (imageId: string) => {
    try {
      await setMainImage(imageId);
    } catch (error) {
      console.error('Error setting main image:', error);
    }
  };

  const getImageUrl = (filePath: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    return `${baseUrl}/${filePath}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-secondary">Imágenes del Producto</h3>
        <label className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
          {isUploading ? 'Subiendo...' : 'Subir Imagen'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border/60 bg-gray-50 p-8 text-center">
          <p className="text-sm text-muted">No hay imágenes cargadas</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-white"
            >
              <img
                src={getImageUrl(image.filePath)}
                alt="Producto"
                className="h-full w-full object-cover transition group-hover:scale-105"
              />

              {/* Main image badge */}
              {image.mainImage && (
                <div className="absolute left-2 top-2 rounded-md bg-yellow-500 px-2 py-1 text-xs font-semibold text-white shadow-md">
                  Principal
                </div>
              )}

              {/* Action buttons */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
                {!image.mainImage && (
                  <button
                    onClick={() => handleSetMain(image.id)}
                    className="rounded-lg bg-yellow-500 p-2 text-white transition hover:bg-yellow-600"
                    title="Marcar como principal"
                  >
                    <Star className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(image.id)}
                  disabled={isDeleting}
                  className="rounded-lg bg-red-500 p-2 text-white transition hover:bg-red-600 disabled:opacity-50"
                  title="Eliminar"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
