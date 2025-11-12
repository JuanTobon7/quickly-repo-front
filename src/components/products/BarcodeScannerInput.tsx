import { useCameraScanner } from '@/hooks/useBarcodeScanner'

interface BarcodeScannerProps {
  isScanning: boolean
  onScan: (code: string) => void
  onClose: () => void
}

export function BarcodeScanner({ isScanning, onScan, onClose }: BarcodeScannerProps) {
  const { videoRef, status } = useCameraScanner(onScan, isScanning)

  if (!isScanning) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      />

      {/* Estado del escáner */}
      <div className="absolute bottom-20 text-center text-sm bg-black/60 px-4 py-2 text-white rounded-md">
        {status}
      </div>

      {/* Botón de cierre */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-2 rounded-lg backdrop-blur-md transition"
      >
        ✕ Cerrar
      </button>

      <div className="absolute bottom-8 text-center text-white text-sm bg-black/30 px-4 py-2 rounded-md">
        Escanea el código de barras
      </div>
    </div>
  )
}
