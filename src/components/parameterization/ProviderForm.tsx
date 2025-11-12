import { useRef, useState } from 'react'
import { driver, DriveStep } from "driver.js"
import "driver.js/dist/driver.css"
import { CircleHelp } from 'lucide-react'

type Props = {
  initial?: { id?: string; name?: string; contact?: string | null }
  onCancel: () => void
  onSubmit: (payload: { id?: string; name: string; contact?: string | null }) => void | Promise<void>
  title?: string
}

enum Side {
  Top = "top",
  Right = "right",
  Bottom = "bottom",
  Left = "left",
}

enum Align {
  Start = "start",
  Center = "center",
  End = "end",
}

export default function ProviderForm({ initial = {}, onCancel, onSubmit, title }: Props) {
  const [name, setName] = useState(initial.name ?? '')
  const [contact, setContact] = useState(initial.contact ?? '')

  const nameRef = useRef<HTMLInputElement>(null)
  const contactRef = useRef<HTMLInputElement>(null)
  const saveBtnRef = useRef<HTMLButtonElement>(null)

  const handleTutorial = () => {
    if (!nameRef.current || !contactRef.current || !saveBtnRef.current) return

    const steps: DriveStep[] = [
      {
        element: nameRef.current,
        popover: {
          title: 'Nombre del proveedor',
          description: 'Este campo es obligatorio. Ingresá el nombre o razón social del proveedor.',
          side: Side.Top,
          align: Align.Start,
        },
      },
      {
        element: contactRef.current,
        popover: {
          title: 'Contacto (opcional)',
          description: 'Podés ingresar un correo o número de teléfono para contacto.',
          side: Side.Right,
          align: Align.Start,
        },
      },
      {
        element: saveBtnRef.current,
        popover: {
          title: 'Guardar cambios',
          description: 'Click aquí para guardar el proveedor o actualizarlo.',
          side: Side.Top,
          align: Align.Center,
        },
      },
    ]

    const d = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Atrás',
      doneBtnText: 'Listo',
      steps,
    })

    d.drive()
  }

  return (
    <div className="space-y-4 rounded-md border border-border overflow-hidden bg-surface p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <h3 className="text-lg font-semibold">{title ?? 'Crear / Editar Proveedor'}</h3>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <button
            type="button"
            className="text-sm text-muted"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="text-sm inline-flex items-center"
            onClick={handleTutorial}
          >
            <CircleHelp className="inline-block h-4 w-4 mr-1" />
            Tutorial
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-muted">
            Nombre <span className="text-danger">*</span>
          </label>
          <input
            ref={nameRef}
            className="w-full rounded-md border border-border bg-white px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Proveedor S.A."
          />
        </div>

        <div>
          <label className="block text-sm text-muted">Contacto (opcional)</label>
          <input
            ref={contactRef}
            className="w-full rounded-md border border-border bg-white px-3 py-2"
            value={contact ?? ''}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email / Teléfono"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          ref={saveBtnRef}
          type="button"
          onClick={() =>
            onSubmit({ id: initial.id, name: name.trim(), contact: contact.trim() || null })
          }
          className="rounded-md bg-primary px-3 py-2 text-white disabled:opacity-60 w-full sm:w-auto"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border px-3 py-2 w-full sm:w-auto"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
