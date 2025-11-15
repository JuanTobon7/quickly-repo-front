import { ArrowDownToLine } from "lucide-react"
import { useRef } from "react"
import { toast } from "sonner"

type ImportButtonProps = {
  acceptedFormats?: string
  afterLoad?: (file: File) => void
}

export default function ImportButton({
  acceptedFormats = ".csv, application/vnd.ms-excel,.xlsx",
  afterLoad,
}: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    toast.success(`File "${file.name}" loaded successfully`)

    // callback opcional para manejar el archivo en el parent
    afterLoad?.(file)

    // opcional: resetear input para permitir cargar el mismo archivo 2 veces
    e.target.value = ""
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleSelectFile}
        className="btn-import inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-secondary transition hover:border-primary/40 hover:text-primary"
      >
        <ArrowDownToLine className="h-4 w-4" />
        Importar
      </button>
    </>
  )
}
