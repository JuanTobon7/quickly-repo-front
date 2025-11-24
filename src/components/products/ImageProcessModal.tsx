import { useEffect, useState } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type ImageProcessModalProps = {
  originalFile: File;
  originalPreview: string;
  processedBlob: Blob;
  processedPreview: string;
  onAccept: (processedBlob: Blob, processedUrl: string) => void;
  onCancel: () => void;
  onSelectNew: () => void;
};

export default function ImageProcessModal({
  originalFile,
  originalPreview,
  processedBlob,
  processedPreview,
  onAccept,
  onCancel,
  onSelectNew,
}: ImageProcessModalProps) {
  const [originalSize, setOriginalSize] = useState<string>('');
  const [processedSize, setProcessedSize] = useState<string>('');

  useEffect(() => {
    setOriginalSize(`${(originalFile.size / 1024).toFixed(2)} KB`);
    setProcessedSize(`${(processedBlob.size / 1024).toFixed(2)} KB`);
  }, [originalFile, processedBlob]);

  const handleAccept = () => {
    onAccept(processedBlob, processedPreview);
    toast.success('Imagen procesada seleccionada');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-xl font-semibold text-secondary">
            Comparar Imagen Original y Procesada
          </h2>
          <button
            onClick={onCancel}
            className="rounded-lg p-2 text-muted transition hover:bg-gray-100"
            title="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          {/* Original Image */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-secondary">
                Imagen Original
              </h3>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-muted">
                {originalSize}
              </span>
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border-2 border-border bg-gray-50">
              <img
                src={originalPreview}
                alt="Original"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="text-xs text-muted">
              Formato: {originalFile.type.split('/')[1]?.toUpperCase()}
            </p>
          </div>

          {/* Processed Image */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary">
                Imagen Procesada
              </h3>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {processedSize}
              </span>
            </div>
            <div className="aspect-square overflow-hidden rounded-lg border-2 border-primary bg-white">
              <img
                src={processedPreview}
                alt="Procesada"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="text-xs text-green-600">
              Formato: WebP • Fondo removido • Optimizada
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:justify-between">
          <button
            onClick={onSelectNew}
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-secondary transition hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
            Seleccionar otra imagen
          </button>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-secondary transition hover:bg-gray-50 sm:flex-initial"
            >
              Cancelar
            </button>
            <button
              onClick={handleAccept}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-md shadow-primary/30 transition hover:bg-primary/90 sm:flex-initial"
            >
              <Check className="h-4 w-4" />
              Usar imagen procesada
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
