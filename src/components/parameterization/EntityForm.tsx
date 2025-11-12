import { useState } from 'react';

type Props = {
  initial?: { id?: string; name?: string };
  onCancel: () => void;
  onSubmit: (payload: { id?: string; name: string }) => void | Promise<void>;
  title?: string;
  example?: string;
};

export default function EntityForm({ initial = {}, onCancel, onSubmit, title, example = 'Nombre del elemento' }: Props) {
  const [name, setName] = useState(initial.name ?? '');

  const saving = false;

  return (
    <div className="space-y-3 rounded-md border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title ?? 'Crear / Editar'}</h3>
        <div className="flex items-center gap-2">
            <button type="button" className="text-sm text-muted" onClick={onCancel}>
              Cancelar
            </button>
          </div>
      </div>
        <div className="space-y-3">
          <label className="block text-sm text-muted">Nombre</label>
          <input
            className="w-full rounded-md border border-border bg-white px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Ej: ${example}`}

          />
        </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => onSubmit({ id: initial.id, name: name.trim() })}
          className="rounded-md bg-primary px-3 py-1 text-white disabled:opacity-60"
        >
          Guardar
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-border px-3 py-1">
          Cancelar
        </button>
      </div>
    </div>
  );
}
