import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DataTable from '../ui/DataTable';
import EntityForm from './EntityForm';
import { Measurement, createMeasurementUnit, deleteMeasurementUnit, getAllMeasurementUnits, updateMeasurementUnit } from '../../services/api/measurementUnits';
import { Plus } from 'lucide-react';

export default function MeasurementUnitSection() {
  const queryKey = ['measurements'];
  const qc = useQueryClient();
  const { data: units = [], isLoading } = useQuery<Measurement[]>({ queryKey, queryFn: getAllMeasurementUnits });

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Measurement | null>(null);

  async function handleCreate(name: string) {
    await createMeasurementUnit({ name });
    qc.invalidateQueries({ queryKey });
  }

  async function handleUpdate(id: string, name: string) {
    await updateMeasurementUnit(id, { name });
    qc.invalidateQueries({ queryKey });
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar unidad de medida?')) return;
    await deleteMeasurementUnit(id);
    qc.invalidateQueries({ queryKey });
  }

  const columns = [
    { header: 'Nombre', accessorKey: 'name' },
    {
      header: 'Acciones',
      cell: (ctx: any) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(ctx.row.original);
            }}
            className="rounded-md border border-border px-2 py-1 text-sm w-full sm:w-auto"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(ctx.row.original.id);
            }}
            className="rounded-md border border-border px-2 py-1 text-sm text-danger w-full sm:w-auto"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-4 rounded-md border border-border/60 bg-white p-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Unidades de Medida</h3>
          <p className="text-sm text-muted">Define las unidades de medida para productos (ej: Kg, L, Unidad).</p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            title="Nueva Unidad de Medida"
            aria-label="Nueva Unidad de Medida"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <DataTable 
          columns={columns}
          pageCount={units.length}
          pageFun={()=>{}}
          data={units} 
          isLoading={isLoading} 
          emptyState="No hay unidades de medida" 
        />
      </div>

      {creating && (
        <EntityForm
          title="Crear Unidad de Medida"
          onCancel={() => setCreating(false)}
          onSubmit={async ({ name }) => {
            if (!name) return alert('El nombre es requerido');
            await handleCreate(name);
            setCreating(false);
          }}
        />
      )}

      {editing && (
        <EntityForm
          title={`Editar Unidad de Medida: ${editing.name}`}
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={async ({ id, name }) => {
            if (!id) return;
            if (!name) return alert('El nombre es requerido');
            await handleUpdate(id, name);
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}
