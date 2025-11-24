import { useState } from 'react';
import DataTable from '../ui/DataTable';
import { Plus } from 'lucide-react';
import { PriceScaleName } from '../../services/api/priceScaleNames';
import { usePriceScaleNames } from '@/hooks/inventory/usePriceScaleNames';

type FormData = {
  id?: string;
  name: string;
  position: number;
  active: boolean;
};

export default function PriceScaleNameSection() {
  const { priceScaleNames = [], setPriceScaleName, remove, isLoading } = usePriceScaleNames();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PriceScaleName | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    position: priceScaleNames.length + 1,
    active: true,
  });

  function handleCreate() {
    if (!formData.name) {
      alert('El nombre es requerido');
      return;
    }
    setPriceScaleName(formData);
    setCreating(false);
    resetForm();
  }

  function handleUpdate() {
    if (!formData.id || !formData.name) {
      alert('El nombre es requerido');
      return;
    }
    setPriceScaleName(formData);
    setEditing(null);
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar nivel de escala? Esto puede afectar productos existentes.')) return;
    remove.mutate(id);
  }

  function resetForm() {
    setFormData({
      name: '',
      position: priceScaleNames.length + 1,
      active: true,
    });
  }

  function openCreate() {
    resetForm();
    setFormData((prev) => ({ ...prev, position: priceScaleNames.length + 1 }));
    setCreating(true);
  }

  function openEdit(item: PriceScaleName) {
    setFormData({
      id: item.id,
      name: item.name,
      position: item.position,
      active: item.active,
    });
    setEditing(item);
  }

  const columns = [
    { header: 'Posición', accessorKey: 'position' },
    { header: 'Nombre', accessorKey: 'name' },
    {
      header: 'Estado',
      cell: (ctx: any) => (
        <span className={ctx.row.original.active ? 'text-green-600' : 'text-gray-400'}>
          {ctx.row.original.active ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      cell: (ctx: any) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(ctx.row.original);
            }}
            className="rounded-md border border-border px-2 py-1 text-sm"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(ctx.row.original.id);
            }}
            className="rounded-md border border-border px-2 py-1 text-sm text-danger"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-4 rounded-md border border-border/60 bg-white p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <h3 className="text-lg font-semibold">Niveles de Escala de Precios</h3>
          <p className="text-sm text-muted max-w-full sm:max-w-md">
            Configura los nombres de los niveles de precios (ej: Mayorista, Minorista). Cada producto tendrá estos niveles con su propia utilidad.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={openCreate}
            title="Nuevo Nivel"
            aria-label="Nuevo Nivel"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* DataTable */}
      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={priceScaleNames}
          pageCount={priceScaleNames.length}
          pageFun={() => {}}
          isLoading={isLoading}
          emptyState="No hay niveles de escala configurados"
        />
      </div>

      {/* Modal Crear */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-md bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Crear Nivel de Escala</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Mayorista"
                  className="w-full rounded border border-border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Posición</label>
                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })}
                  min={1}
                  className="w-full rounded border border-border px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4"
                />
                <label className="text-sm">Activo</label>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  resetForm();
                }}
                className="flex-1 rounded border border-border px-4 py-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="flex-1 rounded bg-primary px-4 py-2 text-white"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-md bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Editar Nivel: {editing.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Mayorista"
                  className="w-full rounded border border-border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Posición</label>
                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })}
                  min={1}
                  className="w-full rounded border border-border px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4"
                />
                <label className="text-sm">Activo</label>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  resetForm();
                }}
                className="flex-1 rounded border border-border px-4 py-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                className="flex-1 rounded bg-primary px-4 py-2 text-white"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
