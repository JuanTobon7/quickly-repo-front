import { useState, useRef, useEffect, memo, forwardRef, useImperativeHandle } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Sparkles, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { ProductImage, uploadProductImage, getProductImages, deleteProductImage } from '@/services/api/productImages';
import { checkImageServiceHealth, processImage } from '@/services/api/images';

// Exportar ref methods
export type ProductImageUploaderRef = {
  uploadPendingImages: () => Promise<boolean>;
};

type ProductImageUploaderProps = {
  productId?: string;
  onImagesChanged?: () => void;
};

export type SelectedImage = {
  file: File;
  preview: string;
  isProcessed: boolean;
  processedBlob?: Blob;
  processedPreview?: string;
  isPending: boolean;
};

export const ProductImageUploader = memo(forwardRef<ProductImageUploaderRef, ProductImageUploaderProps>(({ productId, onImagesChanged }, ref) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageServiceAvailable, setImageServiceAvailable] = useState<boolean | null>(null);
  const [showProcessRecommendation, setShowProcessRecommendation] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{type: 'server' | 'local', index: number, id?: string} | null>(null);

  // Combinar imágenes del servidor y locales pendientes
  const getAllImages = () => {
    const serverImages = Array.isArray(productImages) ? productImages.map(img => {
      const imageUrl = img.filePath.startsWith('http')
        ? img.filePath
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/${img.filePath}`;

      return {
        type: 'server' as const,
        url: imageUrl,
        isMain: img.mainImage,
        id: img.id,
      };
    }) : [];

    const localImages = Array.isArray(selectedImages) ? selectedImages.map(img => ({
      type: 'local' as const,
      url: img.isProcessed && img.processedPreview ? img.processedPreview : img.preview,
      isProcessed: img.isProcessed,
      isPending: img.isPending,
    })) : [];

    return [...serverImages, ...localImages];
  };

  // Check image service health on mount
  useEffect(() => {
    const checkService = async () => {
      try {
        const health = await checkImageServiceHealth();
        const available = health.success && health.data.status === 'available';
        setImageServiceAvailable(available);
      } catch {
        setImageServiceAvailable(false);
      }
    };
    checkService();
  }, []);

  // Load existing images when productId changes
  useEffect(() => {
    const loadImages = async () => {
      if (productId) {
        try {
          const images = await getProductImages(productId);
          setProductImages(images);
        } catch (error: any) {
          console.warn('Could not load product images:', error);
          setProductImages([]);
        }
      }
    };
    loadImages();
  }, [productId]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let serviceAvailable = imageServiceAvailable;
    if (imageServiceAvailable === null) {
      const health = await checkImageServiceHealth();
      serviceAvailable = health.success && health.data.status === 'available';
      setImageServiceAvailable(serviceAvailable);
    }

    const newImages: SelectedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`${file.name} supera el límite de 10 MB`);
        continue;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Formato no soportado`);
        continue;
      }

      const preview = URL.createObjectURL(file);

      newImages.push({
        file,
        preview,
        isProcessed: false,
        isPending: true,
      });
    }

    if (newImages.length > 0) {
      const currentLength = selectedImages.length;

      setSelectedImages(prev => [...prev, ...newImages]);

      setTimeout(() => {
        setCurrentImageIndex(currentLength);
        if (serviceAvailable) {
          setShowProcessRecommendation(true);
        }
      }, 0);

      toast.success(`${newImages.length} imagen(es) agregada(s)`);
    }

    e.target.value = '';
  };

  const handleProcessImage = async () => {
    const currentImage = selectedImages[currentImageIndex];
    if (!currentImage) return;

    setIsProcessingImage(true);

    try {
      toast.info('Procesando imagen...');
      const processedBlob = await processImage(currentImage.file, {
        maxWidth: 1200,
        quality: 85,
        removeBackground: true,
        addWhiteBackground: true,
      });

      const processedUrl = URL.createObjectURL(processedBlob);

      setSelectedImages(prev => prev.map((img, idx) =>
        idx === currentImageIndex
          ? { ...img, processedBlob, processedPreview: processedUrl, isProcessed: true, isPending: false }
          : img
      ));

      setIsProcessingImage(false);
      toast.success('Imagen procesada. Elige la versión a usar.');
    } catch (error: any) {
      console.error('Error processing image:', error);
      toast.error(error.message || 'Error al procesar la imagen');
      setIsProcessingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const imageToRemove = selectedImages[index];

    setTimeout(() => {
      if (imageToRemove.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      if (imageToRemove.processedPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.processedPreview);
      }
    }, 100);

    setSelectedImages(prev => prev.filter((_, idx) => idx !== index));

    if (currentImageIndex >= selectedImages.length - 1) {
      setCurrentImageIndex(Math.max(0, selectedImages.length - 2));
    }

    toast.success('Imagen eliminada');
  };

  const handleUseProcessedVersion = () => {
    setSelectedImages(prev => prev.map((img, idx) =>
      idx === currentImageIndex ? { ...img, isProcessed: true } : img
    ));
    toast.success('Versión procesada seleccionada');
  };

  const handleUseOriginalVersion = () => {
    setSelectedImages(prev => prev.map((img, idx) =>
      idx === currentImageIndex ? { ...img, isProcessed: false } : img
    ));
    toast.success('Versión original seleccionada');
  };

  const handleUseOriginalImages = () => {
    setSelectedImages(prev => prev.map((img, idx) =>
      idx === currentImageIndex ? { ...img, isPending: false, isProcessed: false } : img
    ));
    toast.success('Se usará la imagen original');
  };

  const handleDeleteClick = () => {
    const currentImg = getAllImages()[currentImageIndex];
    
    if (currentImg?.type === 'server') {
      // Imagen del servidor - mostrar modal de confirmación
      setImageToDelete({ type: 'server', index: currentImageIndex, id: currentImg.id });
      setShowDeleteModal(true);
    } else if (currentImg?.type === 'local') {
      // Imagen local - eliminar directamente
      const localIndex = currentImageIndex - productImages.length;
      handleRemoveImage(localIndex);
    }
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;

    if (imageToDelete.type === 'server' && imageToDelete.id && productId) {
      try {
        await deleteProductImage(productId, imageToDelete.id);
        
        // Actualizar lista de imágenes del servidor
        setProductImages(prev => prev.filter(img => img.id !== imageToDelete.id));
        
        // Ajustar índice si es necesario
        const allImages = getAllImages();
        if (currentImageIndex >= allImages.length - 1) {
          setCurrentImageIndex(Math.max(0, allImages.length - 2));
        }
        
        toast.success('Imagen eliminada.');
        onImagesChanged?.();
      } catch (error: any) {
        console.error('Error deleting image:', error);
        toast.error(error.message || 'Error al eliminar la imagen');
      }
    }

    setShowDeleteModal(false);
    setImageToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setImageToDelete(null);
  };

  const handleNextImageInDropdown = () => {
    const nextIndex = currentImageIndex + 1;
    if (nextIndex < selectedImages.length) {
      setCurrentImageIndex(nextIndex);
      toast.info(`Imagen ${nextIndex + 1} de ${selectedImages.length}`);
    } else {
      setShowProcessRecommendation(false);
      toast.success('Todas las imágenes revisadas');
    }
  };

  const handlePrevImageInDropdown = () => {
    const prevIndex = currentImageIndex - 1;
    if (prevIndex >= 0) {
      setCurrentImageIndex(prevIndex);
      toast.info(`Imagen ${prevIndex + 1} de ${selectedImages.length}`);
    }
  };

  // Exponer método para subir imágenes pendientes
  const uploadPendingImages = async () => {
    if (!productId || selectedImages.length === 0) return true;

    setIsUploadingImage(true);

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const img = selectedImages[i];

        const fileToUpload = img.isProcessed && img.processedBlob
          ? new File([img.processedBlob], img.file.name.replace(/\.[^/.]+$/, '.webp'), { type: 'image/webp' })
          : img.file;

        await uploadProductImage(productId, fileToUpload, i === 0);
        toast.success(`Imagen ${i + 1} subida exitosamente`);
      }

      // Cleanup
      selectedImages.forEach(img => {
        if (img.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
        if (img.processedPreview?.startsWith('blob:')) URL.revokeObjectURL(img.processedPreview);
      });

      setSelectedImages([]);
      setCurrentImageIndex(0);

      // Reload images
      const images = await getProductImages(productId);
      setProductImages(Array.isArray(images) ? images : []);

      onImagesChanged?.();

      return true;
    } catch (error: any) {
      console.error('Error uploading images:', error);
      if (error.status === 401 || error.errorCode === 'UNAUTHORIZED') {
        return false;
      }
      toast.error(error.message || 'Error al subir imágenes');
      return false;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    uploadPendingImages,
  }));

  return (
    <div className="relative w-full max-w-[320px]">
      <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-border/60 bg-white">
        {isUploadingImage ? (
          <div className="flex h-full flex-col items-center justify-center">
            <Loader2 className="mb-2 h-12 w-12 animate-spin text-primary" />
            <p className="text-xs text-muted">Subiendo imagen...</p>
          </div>
        ) : getAllImages().length > 0 ? (
          <>
            {getAllImages()[currentImageIndex] && (
              <img
                src={getAllImages()[currentImageIndex].url}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E';
                }}
              />
            )}

            {getAllImages().length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => (prev - 1 + getAllImages().length) % getAllImages().length);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition z-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => (prev + 1) % getAllImages().length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition z-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {getAllImages().map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'
                    }`}
                />
              ))}
            </div>

            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
              {(() => {
                const currentImg = getAllImages()[currentImageIndex];
                if (currentImg?.type === 'server' && currentImg.isMain) {
                  return (
                    <div className="rounded-lg bg-purple-500 px-2 py-1 text-xs font-semibold text-white shadow-md">
                      Principal
                    </div>
                  );
                }
                if (currentImg?.type === 'local') {
                  return (
                    <>
                      {currentImg.isProcessed && (
                        <div className="rounded-lg bg-green-500 px-2 py-1 text-xs font-semibold text-white shadow-md">
                          Procesada
                        </div>
                      )}
                      {currentImg.isPending && (
                        <div className="rounded-lg bg-blue-500 px-2 py-1 text-xs font-semibold text-white shadow-md">
                          Pendiente
                        </div>
                      )}
                    </>
                  );
                }
                return null;
              })()}
            </div>

            <div className="absolute top-2 right-2 rounded-lg bg-black/50 px-2 py-1 text-xs font-semibold text-white">
              {currentImageIndex + 1} / {getAllImages().length}
            </div>

            {/* Botón eliminar - siempre visible */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick();
              }}
              className="absolute bottom-2 right-2 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-600 transition z-10 flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center pointer-events-none">
            <ImagePlus className="mb-2 h-12 w-12 text-muted/40" />
            <p className="text-xs text-muted">Subir imágenes</p>
            <p className="mt-2 text-xs text-gray-500">Puedes seleccionar múltiples</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          disabled={isUploadingImage}
          className="hidden"
        />

        {getAllImages().length === 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 cursor-pointer z-10"
            disabled={isUploadingImage}
          />
        )}

        {getAllImages().length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="absolute top-2 right-2 rounded-lg bg-accent px-2 py-1 text-xs font-semibold text-white shadow-md hover:bg-accent/90 transition z-10"
          >
            + Agregar
          </button>
        )}
      </div>

      {showProcessRecommendation && selectedImages.length > 0 && (
        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-lg animate-in slide-in-from-top-2 duration-300">
          <div className="mb-3 flex items-start gap-2">
            <div className="rounded-full bg-blue-100 p-1.5">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900">
                Procesamiento de Imagen ({currentImageIndex + 1}/{selectedImages.length})
              </h4>
              <p className="mt-0.5 text-xs text-blue-700">
                {selectedImages[currentImageIndex].processedBlob
                  ? 'Elige qué versión usar'
                  : 'Mejora la calidad eliminando el fondo'}
              </p>
            </div>
          </div>

          {selectedImages[currentImageIndex].processedBlob && (
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleUseOriginalVersion}
                className={`relative group rounded-lg overflow-hidden border-2 transition ${!selectedImages[currentImageIndex].isProcessed
                  ? 'border-green-500 ring-2 ring-green-200'
                  : 'border-gray-200 hover:border-green-300'
                  }`}
              >
                <img
                  src={selectedImages[currentImageIndex].preview}
                  alt="Original"
                  className="h-24 w-full object-cover"
                />
                <div className={`absolute bottom-0 inset-x-0 py-1 text-center text-xs font-medium ${!selectedImages[currentImageIndex].isProcessed
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-900/70 text-white group-hover:bg-green-500'
                  }`}>
                  Original {!selectedImages[currentImageIndex].isProcessed && '✓'}
                </div>
              </button>
              <button
                type="button"
                onClick={handleUseProcessedVersion}
                className={`relative group rounded-lg overflow-hidden border-2 transition ${selectedImages[currentImageIndex].isProcessed
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300'
                  }`}
              >
                <img
                  src={selectedImages[currentImageIndex].processedPreview}
                  alt="Procesada"
                  className="h-24 w-full object-cover"
                />
                <div className={`absolute bottom-0 inset-x-0 py-1 text-center text-xs font-medium ${selectedImages[currentImageIndex].isProcessed
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-900/70 text-white group-hover:bg-blue-500'
                  }`}>
                  Procesada {selectedImages[currentImageIndex].isProcessed && '✓'}
                </div>
              </button>
            </div>
          )}

          {!selectedImages[currentImageIndex].processedBlob && (
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={handleUseOriginalImages}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Usar Original
              </button>
              <button
                type="button"
                onClick={handleProcessImage}
                disabled={isProcessingImage}
                className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {isProcessingImage ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  'Procesar Imagen'
                )}
              </button>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-blue-200">
            <button
              type="button"
              onClick={handlePrevImageInDropdown}
              disabled={currentImageIndex === 0}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Anterior
            </button>
            {currentImageIndex < selectedImages.length - 1 ? (
              <button
                type="button"
                onClick={handleNextImageInDropdown}
                className="flex-1 rounded-lg bg-gray-600 px-3 py-2 text-xs font-medium text-white hover:bg-gray-700 transition"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowProcessRecommendation(false);
                  toast.success('Todas las imágenes configuradas');
                }}
                className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 transition"
              >
                Finalizar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar imagen del servidor */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleCancelDelete}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Eliminar imagen?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Esta acción es permanente y no se puede deshacer. La imagen será eliminada y no podrá recuperarse.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelDelete}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}));

ProductImageUploader.displayName = 'ProductImageUploader';
